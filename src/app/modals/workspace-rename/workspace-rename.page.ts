/*src\app\modals\workspace-rename\workspace-rename.page.ts */

import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'app-workspace-rename',
  templateUrl: './workspace-rename.page.html',
  styleUrls: ['./workspace-rename.page.scss'],
})
export class WorkspaceRenamePage implements OnInit {
  @Input() workspaceId!: number;
  @Input() currentName!: string;

  newWorkspaceName: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private modalCtrl: ModalController,
    private workspaceService: WorkspaceService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.newWorkspaceName = this.currentName; // Pre-llenar con el nombre actual
    console.log('DEBUG: [WorkspaceRenamePage] ngOnInit. WorkspaceID:', this.workspaceId, 'CurrentName:', this.currentName);
  }
  
  onNameChange(event: any) {
    const value = event?.target?.value;
    this.newWorkspaceName = value !== undefined ? value : '';
    this.errorMessage = null; // Limpiar error
    console.log('DEBUG: [WorkspaceRenamePage] onNameChange. New name input:', `"${this.newWorkspaceName}"`);
    this.cdr.detectChanges();
  }

  async renameWorkspace() {
    this.cdr.detectChanges();
    console.log('DEBUG: [WorkspaceRenamePage] renameWorkspace. New name:', `"${this.newWorkspaceName}"`);

    if (!this.newWorkspaceName || this.newWorkspaceName.trim() === '') {
      this.errorMessage = 'El nuevo nombre no puede estar vacío.';
      this.showToast('El nuevo nombre no puede estar vacío.', 'warning');
      return;
    }
    if (this.newWorkspaceName.trim() === this.currentName) {
      this.errorMessage = 'El nuevo nombre es igual al actual.';
      this.showToast('El nuevo nombre es igual al nombre actual.', 'warning');
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const loading = await this.loadingCtrl.create({ message: 'Renombrando espacio...' });
    await loading.present();

    this.workspaceService.renameWorkspace(this.workspaceId, this.newWorkspaceName.trim()).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.isLoading = false;
        console.log('DEBUG: [WorkspaceRenamePage] Éxito de renameWorkspace. Respuesta:', response);
        if (response.success) {
          this.showToast(response.message || 'Espacio renombrado.', 'success');
          this.dismissModal({ renamed: true, newName: this.newWorkspaceName.trim() });
        } else {
          this.errorMessage = response.message || 'Error desconocido al renombrar.';
          //this.showToast(this.errorMessage, 'danger');
        }
        this.cdr.detectChanges();
      },
      error: async (error) => {
        await loading.dismiss();
        this.isLoading = false;
        console.error('DEBUG: [WorkspaceRenamePage] Error en renameWorkspace. Error completo:', error);
        let displayError = 'Error al renombrar. Inténtalo de nuevo.';
        if (error && error.error && error.error.message) {
          displayError = error.error.message;
        } else if (error && error.message) {
          displayError = error.message;
        }
        this.errorMessage = displayError;
        this.showToast(displayError, 'danger', 4000);
        this.cdr.detectChanges();
      }
    });
  }

  dismissModal(data?: any) {
    const role = data ? 'confirm' : 'cancel';
    console.log('DEBUG: [WorkspaceRenamePage] Dismissing modal. Role:', role, 'Data:', data);
    this.modalCtrl.dismiss(data, role);
  }

  private async showToast(message: string, color: string = 'primary', duration: number = 3000) {
    const toast = await this.toastCtrl.create({ message, duration, color, position: 'top' });
    toast.present();
  }
}