/* src\app\modals\my-tasks\my-tasks.page.ts */
import { Component, OnInit, Input } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { TaskService } from '../../services/task.service';

// Re-using WorkspaceTask from task.service is fine, but let's define a local one for clarity if needed
export interface AssignedTask {
  id: number;
  note_content: string;
  description: string;
  due_date: string | null;
  assigner_name: string;
  created_at: string;
}

@Component({
  selector: 'app-my-tasks',
  templateUrl: './my-tasks.page.html',
  styleUrls: ['./my-tasks.page.scss'],
})
export class MyTasksPage implements OnInit {
  @Input() workspaceId!: number;
  @Input() workspaceName: string = 'Mis Tareas';

  assignedTasks: AssignedTask[] = [];
  isLoading: boolean = true;

  constructor(
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.loadAssignedTasks();
  }

  async loadAssignedTasks() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({ message: 'Cargando tus tareas...' });
    await loading.present();

    // We assume the service method will handle the current user's UID
    this.taskService.getMyTasksInWorkspace(this.workspaceId).subscribe({
      next: (tasks) => {
        this.assignedTasks = tasks;
        this.isLoading = false;
        loading.dismiss();
      },
      error: async (err) => {
        this.isLoading = false;
        loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: `Error al cargar tareas: ${err.message}`,
          duration: 3000,
          color: 'danger'
        });
        toast.present();
        this.dismiss();
      }
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}