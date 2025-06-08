// src\app\modals\activity-log\activity-log.page.ts
import { Component, OnInit, Input } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { ActivityLogService, ActivityLogEntry } from '../../services/activity-log.service';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.page.html',
  styleUrls: ['./activity-log.page.scss'],
})
export class ActivityLogPage implements OnInit {
  @Input() workspaceId!: number;
  @Input() workspaceName: string = 'Registro de Actividad';

  activityLog: ActivityLogEntry[] = [];
  isLoading: boolean = true;

  constructor(
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private activityLogService: ActivityLogService
  ) {}

  ngOnInit() {
    this.loadActivityLog();
  }

  async loadActivityLog() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({ message: 'Cargando registro...' });
    await loading.present();

    this.activityLogService.getWorkspaceActivityLog(this.workspaceId).subscribe({
      next: (log) => {
        this.activityLog = log;
        this.isLoading = false;
        loading.dismiss();
      },
      error: async (err) => {
        this.isLoading = false;
        loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: `Error al cargar el registro: ${err.message}`,
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