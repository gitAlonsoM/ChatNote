/* src\app\carpeta-create\carpeta-create.page.ts */


import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CarpetaService } from '../services/carpeta.service';

@Component({
  selector: 'app-carpeta-create',
  templateUrl: './carpeta-create.page.html',
  styleUrls: ['./carpeta-create.page.scss'],
})
export class CarpetaCreatePage {
  nombre = '';

  constructor(
    private modalCtrl: ModalController,
    private carpetaSvc: CarpetaService
  ) {}

  /** Cierra el modal sin crear */
  dismiss() {
    this.modalCtrl.dismiss({ refrescar: false });
  }

  /** Crea la carpeta y cierra modal */
  async crear() {
    const n = this.nombre.trim();
    if (!n) { return; }
    // Próxima iteración: POST a Django/Oracle
    await this.carpetaSvc.crearCarpeta(n);
    this.modalCtrl.dismiss({ refrescar: true });
  }
}
