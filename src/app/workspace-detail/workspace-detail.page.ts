//src\app\workspace-detail\workspace-detail.page.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core'; 
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, ToastController, AlertController, MenuController, LoadingController } from '@ionic/angular';
import { WorkspaceService, Workspace } from '../services/workspace.service';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InvitationService } from '../services/invitation.service';
import { WorkspaceRenamePage } from '../modals/workspace-rename/workspace-rename.page';
import { WorkspaceMembersPage } from '../modals/workspace-members/workspace-members.page';
import { WorkspaceInvitePage } from '../modals/workspace-invite/workspace-invite.page';
import { WorkspaceChatService, WorkspaceChatMessage } from '../services/workspace-chat.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-workspace-detail',
  templateUrl: './workspace-detail.page.html',
  styleUrls: ['./workspace-detail.page.scss'],
})
export class WorkspaceDetailPage implements OnInit, OnDestroy {
  @ViewChild('chatMessagesContainer', { static: false }) private chatMessagesContainer!: ElementRef;
  workspace: Workspace | null = null;
  workspaceId: number | null = null;


  messages: WorkspaceChatMessage[] = [];
  userMessage: string = '';
  currentUserId: string | null = null;


  isLoading: boolean = true;
  errorMessage: string | null = null;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workspaceService: WorkspaceService,

    private workspaceChatService: WorkspaceChatService,
    private authService: AuthService,

    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private menuCtrl: MenuController,
    private loadingCtrl: LoadingController,
    private cdr: ChangeDetectorRef,
    private invitationService: InvitationService 
  ) {
    console.log('DEBUG: [WorkspaceDetailPage] Constructor.');



    this.authService.getCurrentUser().then(user => {
      this.currentUserId = user?.uid ?? null;


    });


  }

  ngOnInit() {
    console.log('DEBUG: [WorkspaceDetailPage] ngOnInit.');
    this.route.paramMap.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.workspaceId = +id; 
        console.log('DEBUG: [WorkspaceDetailPage] Workspace ID from route:', this.workspaceId);
        this.loadWorkspaceDetails();
        this.loadChatHistory();

      } else {
        this.isLoading = false;
        this.errorMessage = "No se especificó un ID de espacio.";
        console.error('DEBUG: [WorkspaceDetailPage] No Workspace ID in route.');
        this.cdr.detectChanges();
      }
    });
  }

  async loadWorkspaceDetails() {
    if (!this.workspaceId) return;
    this.isLoading = true;
    this.errorMessage = null;
    console.log('DEBUG: [WorkspaceDetailPage] loadWorkspaceDetails - Loading details for ID:', this.workspaceId);
    this.cdr.detectChanges();

    const loading = await this.loadingCtrl.create({ message: 'Cargando espacio...' });
    await loading.present();

    this.workspaceService.getWorkspaceDetails(this.workspaceId).pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      
      
      
      next: async (data) => {
        await loading.dismiss();
        this.isLoading = false;
        if (data) {
          this.workspace = data;
          console.log('DEBUG: [WorkspaceDetailPage] loadWorkspaceDetails - Data loaded:', this.workspace);
        } else {
          this.errorMessage = `No se pudo encontrar el espacio con ID ${this.workspaceId} o no tienes acceso.`;
          console.warn('DEBUG: [WorkspaceDetailPage] loadWorkspaceDetails - Workspace not found or no access.');
        }
        this.cdr.detectChanges();
      },
      error: async (err) => {
        await loading.dismiss();
        this.isLoading = false;
        this.errorMessage = `Error al cargar el espacio: ${err.message || 'Error desconocido'}`;
        console.error('DEBUG: [WorkspaceDetailPage] loadWorkspaceDetails - Error:', err);
        this.cdr.detectChanges();
      }
    });
  }


  loadChatHistory() {
    if (!this.workspaceId) return;
    console.log(`DEBUG: [WorkspaceDetailPage] Loading chat history for workspace ${this.workspaceId}`);
    this.workspaceChatService.getChatHistory(this.workspaceId).pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: (history) => {
        this.messages = history;
        console.log('DEBUG: [WorkspaceDetailPage] Chat history loaded:', this.messages);
        this.scrollToBottom();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('DEBUG: [WorkspaceDetailPage] Error loading chat history:', err);
        this.showToast('Error al cargar el historial del chat.', 'danger');
      }
    });
  }

  sendMessage() {
    if (!this.userMessage.trim() || !this.workspaceId) return;

    const tempUserMessage: WorkspaceChatMessage = {
      authorId: this.currentUserId || '',
      authorName: 'Tú',
      content: this.userMessage,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    this.messages.push(tempUserMessage);
    this.scrollToBottom();

    const messageToSend = this.userMessage;
    this.userMessage = '';

    const conversationHistoryForLLM = this.messages.map(m => ({ role: m.role, content: m.content }));

    this.workspaceChatService.sendMessageToLLM(this.workspaceId, conversationHistoryForLLM).pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: (response) => {
        const botReplyContent = response?.choices?.[0]?.message?.content || 'No se pudo obtener respuesta.';
        const llmMessage: WorkspaceChatMessage = {
          authorId: this.currentUserId || 'llm-author', // The LLM response is triggered by the current user
          authorName: 'Asistente IA',
          content: botReplyContent,
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
        this.messages.push(llmMessage);
        this.scrollToBottom();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('DEBUG: [WorkspaceDetailPage] Error sending message:', err);
        this.showToast('Error al enviar mensaje al asistente.', 'danger');
      }
    });
  }

  isMyMessage(message: WorkspaceChatMessage): boolean {
    // A message is "mine" if I am the author AND it is not an LLM response.
    // In this non-real-time version, all non-LLM messages are from the current user.
    return message.authorId === this.currentUserId && message.role === 'user';
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatMessagesContainer?.nativeElement) {
        this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
  

  navigateToIndividualSpace() {
    console.log('DEBUG: [WorkspaceDetailPage] navigateToIndividualSpace - Navigating to /chat');
    this.menuCtrl.close('workspaceMenu');
    this.router.navigate(['/chat']); 
  }

  async openRenameWorkspaceModal() {
    if (!this.workspace) return;
    console.log('DEBUG: [WorkspaceDetailPage] openRenameWorkspaceModal for workspace:', this.workspace.nombre);
    await this.menuCtrl.close('workspaceMenu');
    const modal = await this.modalCtrl.create({
      component: WorkspaceRenamePage, 
      componentProps: {
        workspaceId: this.workspace.espacio_id,
        currentName: this.workspace.nombre
      }
    });
    modal.onDidDismiss().then(async (result) => {
      console.log('DEBUG: [WorkspaceDetailPage] Rename modal dismissed. Role:', result.role, 'Data:', result.data);
      if (result.role === 'confirm' && result.data && result.data.renamed) {
        this.showToast('Espacio renombrado exitosamente.', 'success');
        await this.loadWorkspaceDetails(); 
      }
    });
    return await modal.present();
  }



  async openInviteUserModal() {
    if (!this.workspace) return;
    await this.menuCtrl.close('workspaceMenu');
    const modal = await this.modalCtrl.create({
      component: WorkspaceInvitePage,
      componentProps: {
        workspaceId: this.workspace.espacio_id,
        workspaceName: this.workspace.nombre
      }
    });
 
    return await modal.present();
  }

  async leaveWorkspace() {
    if (!this.workspace) return;
    await this.menuCtrl.close('workspaceMenu');
    
    const alert = await this.alertCtrl.create({
      header: 'Abandonar Espacio',
      message: `¿Seguro que quieres abandonar "${this.workspace.nombre}"? Perderás el acceso a su contenido.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Abandonar',
          cssClass: 'danger',
          handler: () => this.confirmLeaveWorkspace()
        }
      ]
    });
    await alert.present();
  }

  private async confirmLeaveWorkspace() {
    if (!this.workspaceId) return;
    const loading = await this.loadingCtrl.create({ message: 'Abandonando espacio...' });
    await loading.present();

    this.invitationService.leaveWorkspace(this.workspaceId).subscribe({
      next: (res: { message: string }) => {
        loading.dismiss();
        this.showToast(res.message, 'success');
        this.router.navigate(['/chat'], { replaceUrl: true });
      },
      error: (err: Error) => {
        loading.dismiss();
        this.showToast(err.message, 'danger');
      }
    });
  
  }




  async openDeleteWorkspaceModal() {
    if (!this.workspace) return;
    console.log('DEBUG: [WorkspaceDetailPage] openDeleteWorkspaceModal for workspace:', this.workspace.nombre);
    await this.menuCtrl.close('workspaceMenu');
    
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar el espacio "${this.workspace.nombre}"? Esta acción es irreversible y eliminará todo su contenido.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('DEBUG: [WorkspaceDetailPage] Eliminación cancelada.');
          }
        }, {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: async () => {
            console.log('DEBUG: [WorkspaceDetailPage] Confirmada eliminación de:', this.workspace?.nombre);
            await this.deleteWorkspaceConfirmed();
          }
        }
      ]
    });
    await alert.present();
  }

  private async deleteWorkspaceConfirmed() {
    if (!this.workspace || !this.workspaceId) return;
    const loading = await this.loadingCtrl.create({ message: 'Eliminando espacio...' });
    await loading.present();

    this.workspaceService.deleteWorkspace(this.workspaceId).pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: async (response) => {
        await loading.dismiss();
        console.log('DEBUG: [WorkspaceDetailPage] deleteWorkspace - Success response:', response);
        if (response.success) {
          this.showToast('Espacio eliminado exitosamente.', 'success');
          this.router.navigate(['/chat']); 
        } else {
          this.showToast(response.message || 'Error al eliminar el espacio.', 'danger');
        }
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('DEBUG: [WorkspaceDetailPage] deleteWorkspace - Error:', err);
        this.showToast(`Error al eliminar: ${err.message || 'Error desconocido'}`, 'danger');
      }
    });
  }
  
  async openViewMembersModal() {
    if (!this.workspaceId) return;
    console.log('DEBUG: [WorkspaceDetailPage] openViewMembersModal for workspace ID:', this.workspaceId);
    await this.menuCtrl.close('workspaceMenu');
    const modal = await this.modalCtrl.create({
        component: WorkspaceMembersPage,
        componentProps: {
            workspaceId: this.workspaceId,
            workspaceName: this.workspace?.nombre 
        }
    });
    return await modal.present();
  }

  goBackToChat() {
    console.log('DEBUG: [WorkspaceDetailPage] goBackToChat - Navigating to /chat due to error or manual action.');
    this.router.navigate(['/chat']);
  }

  private async showToast(message: string, color: string = 'primary', duration: number = 3000) {
    const toast = await this.toastCtrl.create({ message, duration, color, position: 'top' });
    toast.present();
  }

  ngOnDestroy() {
    console.log('DEBUG: [WorkspaceDetailPage] ngOnDestroy.');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }



}