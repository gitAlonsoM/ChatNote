//src\app\modals\invitations-manager\invitations-manager.page.ts

import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Invitation, InvitationService } from 'src/app/services/invitation.service';


@Component({
  selector: 'app-invitations-manager',
  templateUrl: './invitations-manager.page.html',
  styleUrls: ['./invitations-manager.page.scss'],
})
export class InvitationsManagerPage implements OnInit {
  invitations: Invitation[] = [];
  isLoading: boolean = true;
  isResponding: { [key: number]: boolean } = {};

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private invitationService: InvitationService
  ) {}

  ngOnInit() {
    this.loadInvitations();
  }
  loadInvitations() {
    this.isLoading = true;
    this.invitationService.getPendingInvitations().subscribe({
      next: (data: Invitation[]) => { // Explicitly type the parameter
        this.invitations = data;
        this.isLoading = false;
      },
      error: (err: any) => { // Explicitly type the parameter
        this.showToast(err.message, 'danger');
        this.isLoading = false;
      }
    });
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  respond(workspaceId: number, response: 'ACEPTADO' | 'RECHAZADO', index: number) {
    this.isResponding[index] = true;
    this.invitationService.respondToInvitation(workspaceId, response).subscribe({
      next: (res: any) => { // Explicitly type the parameter
        this.showToast(res.message, 'success');
        this.invitations.splice(index, 1); // Remove from list
        this.isResponding[index] = false;
        // Notify the main app that data needs to be reloaded
        this.modalCtrl.dismiss({ reloaded: true }, 'confirm');
      },
      error: (err: any) => { // Explicitly type the parameter
        this.showToast(err.message, 'danger');
        this.isResponding[index] = false;
      }
    });
  }

  async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }
}