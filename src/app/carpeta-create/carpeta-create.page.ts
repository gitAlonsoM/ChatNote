/* src/app/carpeta-create/carpeta-create.page.ts */
import { Component, ChangeDetectorRef } from '@angular/core'; // Importar ChangeDetectorRef
import { ModalController, ToastController } from '@ionic/angular';
import { CarpetaService } from '../services/carpeta.service';

@Component({
  selector: 'app-carpeta-create',
  templateUrl: './carpeta-create.page.html',
  styleUrls: ['./carpeta-create.page.scss'],
})
export class CarpetaCreatePage {
  nombre: string = '';

  constructor(
    private modalCtrl: ModalController,
    private carpetaService: CarpetaService,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef // Inyectar ChangeDetectorRef
  ) {
    console.log('[CarpetaCreatePage] Constructor. Valor inicial de this.nombre:', `"${this.nombre}"`);
  }

  // Añadir un método que se llame en el evento (input) del ion-input
  onNombreChange(event: any) {
    const valorIngresado = event?.target?.value;
    console.log('[CarpetaCreatePage] Evento (input) disparado. Valor del input:', `"${valorIngresado}"`);
    this.nombre = valorIngresado !== undefined ? valorIngresado : ''; 
    // this.cdr.detectChanges(); // Forzar detección de cambios
  }

  dismiss(data?: any) {
    // ... (sin cambios)
    const role = data ? 'confirm' : 'cancel';
    console.log('[CarpetaCreatePage] Dismissing modal with role:', role, 'and data:', data);
    this.modalCtrl.dismiss(data, role);
  }

  async crear() {
    console.log('[CarpetaCreatePage] Método crear() INVOCADO. Valor actual de this.nombre ANTES de forzar CDR:', `"${this.nombre}"`);

    // Forzar la detección de cambios justo antes de usar la variable
    // A veces ngModel en modales necesita esta "ayuda"
    this.cdr.detectChanges();
    console.log('[CarpetaCreatePage] Método crear(). Valor actual de this.nombre DESPUÉS de forzar CDR:', `"${this.nombre}"`);


    if (!this.nombre || this.nombre.trim() === '') {
      console.warn('[CarpetaCreatePage] Validación fallida: this.nombre está vacío o solo espacios. Valor exacto:', `"${this.nombre}"`);
      const toast = await this.toastCtrl.create({
        message: 'El nombre de la carpeta no puede estar vacío.',
        duration: 2000,
        color: 'warning',
        position: 'top'
      });
      toast.present();
      return;
    }

    const nombreCarpetaTrimmed = this.nombre.trim();
    console.log('[CarpetaCreatePage] Validación superada. Llamando a carpetaService.createPersonalFolder con nombre:', nombreCarpetaTrimmed);

    this.carpetaService.createPersonalFolder(nombreCarpetaTrimmed).subscribe({
      next: async (response) => {
        console.log('[CarpetaCreatePage] Éxito de createPersonalFolder. Respuesta del servicio:', response);
        const toast = await this.toastCtrl.create({
          message: `Carpeta "${nombreCarpetaTrimmed}" creada exitosamente.`,
          duration: 2500,
          color: 'success',
          position: 'top'
        });
        toast.present();
        this.dismiss({ created: true, folderName: nombreCarpetaTrimmed, serverResponse: response });
      },
      error: async (error) => {
        console.error('[CarpetaCreatePage] Error en createPersonalFolder. Error completo:', error);
        let detailedErrorMessage = 'Error desconocido al crear la carpeta.';
        if (error && error.error && typeof error.error === 'object' && error.error.error) {
            detailedErrorMessage = error.error.error;
        } else if (error && error.error && typeof error.error === 'string') {
            detailedErrorMessage = error.error;
        } else if (error && error.message) {
            detailedErrorMessage = error.message;
        }

        if (error.status === 0) {
            detailedErrorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else if (error.status === 500) {
            detailedErrorMessage = 'Error interno del servidor. Inténtalo más tarde.';
        } else if (error.status === 400 && detailedErrorMessage.includes("uid and nombre required")) {
            detailedErrorMessage = 'Faltan datos necesarios (UID o nombre) para crear la carpeta.';
        } else if (error.status === 400 && detailedErrorMessage.includes("nombre is required")) {
            detailedErrorMessage = 'El nombre de la carpeta es obligatorio.';
        }

        const toast = await this.toastCtrl.create({
          message: detailedErrorMessage,
          duration: 3500,
          color: 'danger',
          position: 'top'
        });
        toast.present();
      }
    });
  }
}