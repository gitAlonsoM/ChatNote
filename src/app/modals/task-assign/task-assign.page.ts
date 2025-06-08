//src\app\modals\task-assign\task-assign.page.ts
import { Component, Input, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { WorkspaceService, WorkspaceMember } from '../../services/workspace.service';
import { format, parseISO } from 'date-fns';
import { TaskService } from 'src/app/services/task.service';


@Component({
  selector: 'app-task-assign',
  templateUrl: './task-assign.page.html',
  styleUrls: ['./task-assign.page.scss'],
})
export class TaskAssignPage implements OnInit {
  @Input() workspaceId!: number;
  @Input() folderId!: number;
  @Input() noteId!: number;
  @Input() noteContent!: string;

  // For editing existing task
  @Input() isEditMode: boolean = false;
  @Input() taskToEdit: any = null; // Can be a WorkspaceTask

  members: WorkspaceMember[] = [];
  selectedAssigneeId: string = '';
  description: string = '';
  dueDate: string | null = null;
  formattedDueDate: string = '';
  
  pageTitle: string = 'Asignar Tarea';

  constructor(
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private workspaceService: WorkspaceService,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    if (this.isEditMode && this.taskToEdit) {
      this.pageTitle = 'Editar Tarea';
      this.selectedAssigneeId = this.taskToEdit.assignee_id;
      this.description = this.taskToEdit.description;
      if (this.taskToEdit.due_date) {
        this.dueDate = this.taskToEdit.due_date;
        this.formattedDueDate = format(parseISO(this.taskToEdit.due_date), 'dd MMMM yyyy');
      }
    }
    this.loadMembers();
  }

  async loadMembers() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando miembros...' });
    await loading.present();
    this.workspaceService.listWorkspaceMembers(this.workspaceId).subscribe({
      next: (members) => {
        this.members = members;
        loading.dismiss();
      },
      error: (err) => {
        loading.dismiss();
        this.presentToast(`Error: ${err.message}`, 'danger');
      }
    });
  }

  dateChanged(event: any) {
    if (event.detail.value) {
      this.dueDate = event.detail.value;
      this.formattedDueDate = format(parseISO(event.detail.value), 'dd MMMM yyyy');
    }
  }

  clearDate() {
    this.dueDate = null;
    this.formattedDueDate = '';
  }
  
  async confirm() {
    if (!this.selectedAssigneeId) {
      this.presentToast('Debes seleccionar un miembro para asignar la tarea.', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: this.isEditMode ? 'Actualizando...' : 'Asignando...' });
    await loading.present();

    const action$ = this.isEditMode
      ? this.taskService.updateTask(this.workspaceId, this.taskToEdit.id, this.selectedAssigneeId, this.description, this.dueDate)
      : this.taskService.assignTask(this.workspaceId, this.folderId, this.noteId, this.selectedAssigneeId, this.description, this.dueDate);

    action$.subscribe({
      next: () => {
        loading.dismiss();
        this.presentToast(`Tarea ${this.isEditMode ? 'actualizada' : 'asignada'} con éxito`, 'success');
        this.modalCtrl.dismiss({ success: true });
      },
      error: (err: any) => {
        loading.dismiss();
        this.presentToast(`Error: ${err.message}`, 'danger');
      }
    });
  }
  
  cancel() {
    this.modalCtrl.dismiss();
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 2500, color, position: 'top' });
    toast.present();
  }
}