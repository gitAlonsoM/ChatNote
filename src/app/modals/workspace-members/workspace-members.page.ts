/* src\app\modals\workspace-members\workspace-members.page.ts */

import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { WorkspaceService, WorkspaceMember } from '../../services/workspace.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-workspace-members',
  templateUrl: './workspace-members.page.html',
  styleUrls: ['./workspace-members.page.scss'],
})
export class WorkspaceMembersPage implements OnInit {
  @Input() workspaceId!: number;
  @Input() workspaceName: string = 'Espacio Colaborativo';

  members: WorkspaceMember[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private modalCtrl: ModalController,
    private workspaceService: WorkspaceService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('DEBUG: [WorkspaceMembersPage] ngOnInit. WorkspaceID:', this.workspaceId);
    this.loadMembers();
  }

  async loadMembers() {
    if (!this.workspaceId) {
      this.errorMessage = "ID de espacio no proporcionado.";
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    const loading = await this.loadingCtrl.create({ message: 'Cargando miembros...' });
    await loading.present();

    this.workspaceService.listWorkspaceMembers(this.workspaceId).pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: async (data) => {
        await loading.dismiss();
        this.isLoading = false;
        this.members = data;
        console.log('DEBUG: [WorkspaceMembersPage] Miembros cargados:', this.members.length);
        if (this.members.length === 0) {
            // No es un error, simplemente no hay miembros (o el owner es el único)
            // this.showToast('Este espacio aún no tiene otros miembros.', 'medium');
        }
        this.cdr.detectChanges();
      },
      error: async (err) => {
        await loading.dismiss();
        this.isLoading = false;
        this.errorMessage = `Error al cargar miembros: ${err.message || 'Error desconocido'}`;
        console.error('DEBUG: [WorkspaceMembersPage] Error cargando miembros:', err);
        this.showToast(this.errorMessage, 'danger');
        this.cdr.detectChanges();
      }
    });
  }

  dismissModal() {
    console.log('DEBUG: [WorkspaceMembersPage] Dismissing modal.');
    this.modalCtrl.dismiss();
  }

  private async showToast(message: string, color: string = 'primary', duration: number = 3000) {
    const toast = await this.toastCtrl.create({ message, duration, color, position: 'top' });
    toast.present();
  }

  ngOnDestroy() {
    console.log('DEBUG: [WorkspaceMembersPage] ngOnDestroy.');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}