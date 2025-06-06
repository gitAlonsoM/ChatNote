//src\app\modals\workspace-invite\workspace-invite.page.ts
import { Component, Input } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { InvitationService } from 'src/app/services/invitation.service';


@Component({
  selector: 'app-workspace-invite',
  templateUrl: './workspace-invite.page.html',
})
export class WorkspaceInvitePage {
  @Input() workspaceId!: number;
  @Input() workspaceName!: string;
  email: string = '';
  isInviting: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private invitationService: InvitationService
  ) {}

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async invite() {
    if (!this.email || this.isInviting) return;
    this.isInviting = true;

    const loading = await this.loadingCtrl.create({ message: 'Enviando invitación...' });
    await loading.present();


 this.invitationService.inviteUser(this.workspaceId, this.email).subscribe({
      next: (response: { message: string }) => {
        loading.dismiss();
        this.isInviting = false;
        this.showToast(response.message, 'success');
        this.modalCtrl.dismiss({ invited: true }, 'confirm');
      },
      error: (err: Error) => {
        loading.dismiss();
        this.isInviting = false;
        this.showToast(err.message, 'danger');
      }
    });
  }

  async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }
}