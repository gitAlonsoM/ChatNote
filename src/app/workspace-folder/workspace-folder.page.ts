// src\app\workspace-folder\workspace-folder.page.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController, NavController, ActionSheetController, ModalController } from '@ionic/angular';
import { WorkspaceFolderService, WorkspaceNote, WorkspaceFolder } from '../services/workspace-folder.service';
import { Subscription, forkJoin } from 'rxjs';
import { TaskAssignPage } from '../modals/task-assign/task-assign.page'; // Import the new modal
import { TaskService, WorkspaceTask } from '../services/task.service';



@Component({
  selector: 'app-workspace-folder',
  templateUrl: './workspace-folder.page.html',
  styleUrls: ['./workspace-folder.page.scss'],
})
export class WorkspaceFolderPage implements OnInit, OnDestroy {
  workspaceId: number | null = null;
  folderId: number | null = null;
  folderName: string = 'Cargando...';

  notes: WorkspaceNote[] = [];
  tasks: WorkspaceTask[] = [];

  newNoteContent: string = '';
  isLoading: boolean = true;
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private wsFolderService: WorkspaceFolderService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private actionSheetCtrl: ActionSheetController,
    private cdr: ChangeDetectorRef,
    private taskService: TaskService,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    const routeSub = this.route.paramMap.subscribe(params => {
      this.workspaceId = +(params.get('workspaceId') || 0);
      this.folderId = +(params.get('folderId') || 0);

      if (this.workspaceId && this.folderId) {
        this.loadInitialData();
      }
    });
    this.subscriptions.add(routeSub);
  }


loadInitialData() {
    if (!this.workspaceId || !this.folderId) return;
    this.isLoading = true;
    const folderInfo$ = this.wsFolderService.getFolders(this.workspaceId);
    const content$ = this.wsFolderService.getFolderContent(this.workspaceId, this.folderId);

    const initialLoadSub = forkJoin([folderInfo$, content$]).subscribe({
      next: ([folders, content]) => {
        const currentFolder = folders.find(f => f.id === this.folderId);
        this.folderName = currentFolder ? currentFolder.name : 'Carpeta no encontrada';
        console.log('DEBUG: Received content from service:', JSON.stringify(content));
        // ======== Start Modification ========
        // Defensive assignment: Ensure that notes and tasks are always arrays.
        // If content.notes or content.tasks is missing (undefined), default to an empty array [].
        this.notes = content.notes || [];
        this.tasks = content.tasks || [];
        // ======== End Modification ========
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.presentToast(`Error cargando datos: ${err.message}`, 'danger');
        this.navCtrl.back();
      }
    });
    this.subscriptions.add(initialLoadSub);
  }
 loadContent() { 
    if (!this.workspaceId || !this.folderId) return;
    this.isLoading = true;
    const contentSub = this.wsFolderService.getFolderContent(this.workspaceId, this.folderId).subscribe({
      next: content => {


        this.notes = content.notes || [];
        this.tasks = content.tasks || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
       error: (err: any) => { 
        this.isLoading = false;
        this.presentToast(`Error al recargar contenido: ${err.message}`, 'danger');
      }
    });
    this.subscriptions.add(contentSub);
  }
  
  createNote() {
    if (!this.newNoteContent.trim() || !this.workspaceId || !this.folderId) return;
    const noteSub = this.wsFolderService.createNote(this.workspaceId, this.folderId, this.newNoteContent.trim()).subscribe({
      next: () => {
        this.presentToast('Nota creada', 'success');
        this.newNoteContent = '';
        this.loadContent(); // Use new method
      },
      error: err => this.presentToast(err.message, 'danger')
    });
    this.subscriptions.add(noteSub);
  }

    async presentAssignTaskModal(note: WorkspaceNote) {
    if (!this.workspaceId || !this.folderId) return;
    const modal = await this.modalCtrl.create({
      component: TaskAssignPage,
      componentProps: {
        workspaceId: this.workspaceId,
        folderId: this.folderId,
        noteId: note.id,
        noteContent: note.content
      }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.success) {
      this.loadContent();
    }
  }

  async editTask(task: WorkspaceTask) {
     if (!this.workspaceId || !this.folderId) return;
    const modal = await this.modalCtrl.create({
      component: TaskAssignPage,
      componentProps: {
        workspaceId: this.workspaceId,
        folderId: this.folderId,
        isEditMode: true,
        taskToEdit: task,
      }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.success) {
      this.loadContent();
    }
  }

  async deleteTask(task: WorkspaceTask) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Quitar la asignación de esta tarea? La tarea volverá a ser una nota normal.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Quitar', role: 'destructive', handler: () => {
          if (!this.workspaceId) return;
          const deleteTaskSub = this.taskService.deleteTask(this.workspaceId, task.id).subscribe({
            next: () => { this.presentToast('Tarea desasignada.', 'success'); this.loadContent(); },
            error: err => this.presentToast(err.message, 'danger')
          });
          this.subscriptions.add(deleteTaskSub);
        }}
      ]
    });
    await alert.present();
  }

  async editNote(note: WorkspaceNote) {
    const alert = await this.alertCtrl.create({
      header: 'Editar Nota',
      inputs: [{ name: 'content', type: 'textarea', value: note.content }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Guardar', handler: (data) => {
          if (data.content.trim() && data.content.trim() !== note.content) {
            if (!this.workspaceId || !this.folderId) return;
             const updateSub = this.wsFolderService.updateNote(this.workspaceId, this.folderId, note.id, data.content.trim()).subscribe({
              next: () => { this.presentToast('Nota actualizada', 'success'); this.loadContent(); },
              error: err => this.presentToast(err.message, 'danger')
            });
            this.subscriptions.add(updateSub);
          }
        }}
      ]
    });
    await alert.present();
  }

  async deleteNote(note: WorkspaceNote) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: `¿Eliminar la nota "${note.content.substring(0, 30)}..."?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
          { text: 'Eliminar', role: 'destructive', handler: () => {
            if (!this.workspaceId || !this.folderId) return;
            const deleteSub = this.wsFolderService.deleteNote(this.workspaceId, this.folderId, note.id).subscribe({
              next: () => { this.presentToast('Nota eliminada', 'success'); this.loadContent(); }, 
              error: err => this.presentToast(err.message, 'danger')
            });
            this.subscriptions.add(deleteSub);
        }}
      ]
    });
    await alert.present();
  }

  async presentFolderActions() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Acciones de Carpeta',
      buttons: [
        { text: 'Renombrar', icon: 'create-outline', handler: () => this.renameFolder() },
        { text: 'Eliminar', icon: 'trash-outline', role: 'destructive', handler: () => this.deleteFolder() },
        { text: 'Cancelar', icon: 'close', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async renameFolder() {
    const alert = await this.alertCtrl.create({
      header: 'Renombrar Carpeta',
      inputs: [{ name: 'name', type: 'text', value: this.folderName }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Guardar', handler: data => {
          if (data.name.trim() && data.name.trim() !== this.folderName) {
             if (!this.workspaceId || !this.folderId) return;
             const renameSub = this.wsFolderService.renameFolder(this.workspaceId, this.folderId, data.name.trim()).subscribe({
               next: () => {
                 this.presentToast('Carpeta renombrada', 'success');
                 this.folderName = data.name.trim();
                 this.cdr.detectChanges();
               },
               error: err => this.presentToast(err.message, 'danger')
             });
             this.subscriptions.add(renameSub);
          }
        }}
      ]
    });
    await alert.present();
  }

  async deleteFolder() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: '¿Seguro que quieres eliminar esta carpeta y todas sus notas? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => {
          if (!this.workspaceId || !this.folderId) return;
          const deleteFolderSub = this.wsFolderService.deleteFolder(this.workspaceId, this.folderId).subscribe({
            next: () => {
              this.presentToast('Carpeta eliminada.', 'success');
              this.router.navigate(['/espacio', this.workspaceId]);
            },
            error: err => this.presentToast(err.message, 'danger')
          });
          this.subscriptions.add(deleteFolderSub);
        }}
      ]
    });
    await alert.present();
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 2500, color, position: 'top' });
    toast.present();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
