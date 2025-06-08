//src\app\workspace-detail\workspace-detail.page.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core'; 
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
export class WorkspaceDetailPage implements OnInit, OnDestroy{


  @ViewChild('chatMessagesContainer', { static: false }) private chatMessagesContainer!: ElementRef;
 workspace: Workspace | null = null;
  workspaceId: number | null = null;
  messages: WorkspaceChatMessage[] = [];
  userMessage: string = '';
  currentUserId: string | null = null;


  currentUserEmail: string | null = null;
  currentUserName: string | null = null;
  
  isLlmMode: boolean = false; // To track if we are in "ask the AI" mode


  isLoading: boolean = true;
  errorMessage: string | null = null;
  private ngUnsubscribe = new Subject<void>();
  private needsScroll: boolean = false;


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
      this.currentUserEmail = user?.email ?? null;
      // Note: Firebase User object doesn't have a 'name' field by default.
      // We get it from the user's profile or derive it from the email.
      this.currentUserName = user?.displayName || user?.email?.split('@')[0] || 'Usuario';
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
        this.initializeChat(); // Combined initialization


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

  initializeChat() {
    if (!this.workspaceId) return;

    // 1. Get initial history via HTTP
    this.workspaceChatService.getChatHistory(this.workspaceId).pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: (history: WorkspaceChatMessage[]) => {

      this.messages = history;
        console.log('DEBUG: [WorkspaceDetailPage] Chat history loaded, now scrolling to bottom.', this.messages);
        // Trigger change detection to render the initial history
        this.cdr.detectChanges(); 
        // Call scrollToBottom to position the view at the end of the loaded history
        this.scrollToBottom();

        // 2. Connect to WebSocket only AFTER history is successfully loaded
        this.workspaceChatService.connect(this.workspaceId!);
        
        // 3. Subscribe to real-time messages from the WebSocket service
        this.workspaceChatService.messages$.pipe(
          takeUntil(this.ngUnsubscribe)
        ).subscribe((message: WorkspaceChatMessage) => {
            // A message is an "echo" of our own *user* message if the authorId matches ours
          // AND the role is 'user'. We already added this message optimistically.
          const isOwnUserMessageEcho = message.authorId === this.currentUserId && message.role === 'user';

          if (isOwnUserMessageEcho) {
            // This is the echo of our own message. We can ignore it.
            console.log('DEBUG: [WorkspaceDetailPage] Echo of own user message received, ignoring.', message);
          } else {
            // This is either a message from another user or an assistant response. Display it.
            console.log('DEBUG: [WorkspaceDetailPage] Real-time message received from another source (user or assistant):', message);
            this.messages.push(message);
            this.scrollToBottom();
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => {
        console.error('DEBUG: [WorkspaceDetailPage] Error loading chat history:', err);
        this.showToast('Error al cargar el historial del chat.', 'danger');
      }
    });
  }

  // This method now sends data through the WebSocket, not via HTTP.
   sendMessage() {
    if (!this.userMessage.trim() || !this.workspaceId || !this.currentUserId || !this.currentUserName || !this.currentUserEmail) {
      console.warn('DEBUG: Cannot send message, missing user info or message content.');
      return;
    }

    const messageToSend = this.isLlmMode ? `/@ ${this.userMessage}` : this.userMessage;

    // --- Optimistic UI Update ---
    // Create the message object locally *before* sending it.
    // This makes the UI feel instantaneous.
    const optimisticMessage: WorkspaceChatMessage = {
      authorId: this.currentUserId,
      authorName: this.currentUserName, // Or a display name like 'Yo'
      content: messageToSend,
      role: 'user',
      timestamp: new Date().toISOString() // Use local time for immediate display
    };

    // Push the message to the local array immediately.
    this.messages.push(optimisticMessage);
    
    // Trigger scroll for our own message instantly.
    this.scrollToBottom();
    
    // --- Send to Server ---
    const payload = {
      message: messageToSend,
      uid: this.currentUserId,
      name: this.currentUserName, // Send the real name to the server
      email: this.currentUserEmail,
    };
    
    this.workspaceChatService.sendMessage(payload);

    // Clear the input field and reset mode.
    this.userMessage = '';
    this.isLlmMode = false;
  }


  toggleLlmMode() {
    this.isLlmMode = !this.isLlmMode;
  }




  
  isMyMessage(message: WorkspaceChatMessage): boolean {
    // A message is "mine" if I am the author AND it is not an LLM response.
    // In this non-real-time version, all non-LLM messages are from the current user.
    return message.authorId === this.currentUserId && message.role === 'user';
  }

  private scrollToBottom(): void {
 // Use setTimeout with a small but non-zero delay (e.g., 50-100ms).
    // This gives the browser's rendering engine enough time to process the DOM updates
    // from Angular's change detection and calculate the new correct scrollHeight.
    // A 0ms timeout can sometimes be too fast.
    setTimeout(() => {
      try {
        if (this.chatMessagesContainer?.nativeElement) {
          const container = this.chatMessagesContainer.nativeElement;
          container.scrollTop = container.scrollHeight;
          console.log('DEBUG: Scrolled to bottom. New scrollHeight:', container.scrollHeight);
        }
      } catch (err) {
        console.error('DEBUG: Could not scroll to bottom:', err);
      }
    }, 100); // Using a 100ms delay for robustness
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
    console.log('DEBUG: [WorkspaceDetailPage] ngOnDestroy. Disconnecting WebSocket.');
    this.workspaceChatService.disconnect(); // Disconnect the WebSocket
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


}