//src\app\modals\workspace-create\workspace-create.page.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { WorkspaceService } from '../../services/workspace.service'; // Ajustar ruta si es necesario

@Component({
  selector: 'app-workspace-create',
  templateUrl: './workspace-create.page.html',
  styleUrls: ['./workspace-create.page.scss'],
})
export class WorkspaceCreatePage implements OnInit {
  workspaceName: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private modalCtrl: ModalController,
    private workspaceService: WorkspaceService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private cdr: ChangeDetectorRef
  ) {
    console.log('DEBUG: [WorkspaceCreatePage] Constructor. Nombre inicial:', `"${this.workspaceName}"`);
  }

  ngOnInit() {
    console.log('DEBUG: [WorkspaceCreatePage] ngOnInit.');
  }

  onNameChange(event: any) {
    const value = event?.target?.value;
    this.workspaceName = value !== undefined ? value : '';
    this.errorMessage = null; // Limpiar error al escribir
    console.log('DEBUG: [WorkspaceCreatePage] onNameChange. Nuevo nombre:', `"${this.workspaceName}"`);
    this.cdr.detectChanges();
  }

  async createWorkspace() {
    this.cdr.detectChanges(); // Asegurar que workspaceName esté actualizado
    console.log('DEBUG: [WorkspaceCreatePage] createWorkspace. Nombre actual:', `"${this.workspaceName}"`);

    if (!this.workspaceName || this.workspaceName.trim() === '') {
      this.errorMessage = 'El nombre del espacio no puede estar vacío.';
      console.warn('DEBUG: [WorkspaceCreatePage] Validación fallida: nombre vacío.');
      this.showToast('El nombre del espacio no puede estar vacío.', 'warning');
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const loading = await this.loadingCtrl.create({ message: 'Creando espacio...' });
    await loading.present();

    this.workspaceService.createWorkspace(this.workspaceName.trim()).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.isLoading = false;
        console.log('DEBUG: [WorkspaceCreatePage] Éxito de createWorkspace. Respuesta:', response);
        if (response.success) {
          this.showToast(`Espacio "${this.workspaceName.trim()}" creado. ID: ${response.espacio_id}`, 'success');
          this.dismissModal({ created: true, workspaceName: this.workspaceName.trim(), workspaceId: response.espacio_id });
        } else {
          // Error manejado por el backend que no es una excepción HTTP
          this.errorMessage = response.message || 'Error desconocido al crear el espacio.';
          //this.showToast(this.errorMessage, 'danger'); //da error esta linea rgument of type 'string | null' is not assignable to parameter of type 'string'. Se ha comentado
        }
        this.cdr.detectChanges();
      },
      error: async (error) => {
        await loading.dismiss();
        this.isLoading = false;
        console.error('DEBUG: [WorkspaceCreatePage] Error en createWorkspace. Error completo:', error);
        
        let displayError = 'Error al crear el espacio. Inténtalo de nuevo.';
        if (error && error.error && error.error.message) {
          displayError = error.error.message;
        } else if (error && error.message) {
          displayError = error.message; // Para errores de red o errores string de throwError
        }
        
        this.errorMessage = displayError;
        this.showToast(displayError, 'danger', 4000);
        this.cdr.detectChanges();
      }
    });
  }

  dismissModal(data?: any) {
    const role = data ? 'confirm' : 'cancel';
    console.log('DEBUG: [WorkspaceCreatePage] Dismissing modal. Role:', role, 'Data:', data);
    this.modalCtrl.dismiss(data, role);
  }

  private async showToast(message: string, color: string = 'primary', duration: number = 3000) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      color,
      position: 'top'
    });
    toast.present();
  }
}