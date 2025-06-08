/* src/app/carpeta-create/carpeta-create.page.ts */
import { Component, ChangeDetectorRef } from '@angular/core'; // Importar ChangeDetectorRef
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-carpeta-create',
  templateUrl: './carpeta-create.page.html',
  styleUrls: ['./carpeta-create.page.scss'],
})
export class CarpetaCreatePage {
  nombre: string = '';

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef // Inyectar ChangeDetectorRef
  ) {
    console.log('[CarpetaCreatePage] Constructor. Valor inicial de this.nombre:', `"${this.nombre}"`);
    console.log('DEBUG: CarpetaCreatePage - CONSTRUCTOR - Modal component is being created.');

  }

  // Añadir un método que se llame en el evento (input) del ion-input
  onNombreChange(event: any) {
    const valorIngresado = event?.target?.value;
    console.log('[CarpetaCreatePage] Evento (input) disparado. Valor del input:', `"${valorIngresado}"`);
    this.nombre = valorIngresado !== undefined ? valorIngresado : ''; 
    // this.cdr.detectChanges(); // Forzar detección de cambios
  }

  dismiss(data?: any) {
    const role = data ? 'confirm' : 'cancel';
    console.log('[CarpetaCreatePage] Dismissing modal with role:', role, 'and data:', data);
    this.modalCtrl.dismiss(data, role);
  }

   debugClickAndCreate() {
    // This is the most important log. If it doesn't appear, the problem is the template binding.
    console.log('DEBUG: Botón "Crear" CLICKEADO. Ejecutando debugClickAndCreate().');
    this.crear();
  }

async crear() {
    this.cdr.detectChanges();
    const nombreCarpetaTrimmed = this.nombre.trim();
    console.log(`DEBUG: CarpetaCreatePage - CREAR button clicked. Validating name: "${nombreCarpetaTrimmed}"`);
    if (!nombreCarpetaTrimmed) {
      const toast = await this.toastCtrl.create({
        message: 'El nombre de la carpeta no puede estar vacío.',
        duration: 2000,
        color: 'warning',
        position: 'top'
      });
      toast.present();
      return;
    }

 const dataToReturn = {
      created: true,
      folderName: nombreCarpetaTrimmed,
    };
    console.log('DEBUG: CarpetaCreatePage - Validation PASSED. Preparing to dismiss modal with data:', dataToReturn);
    this.dismiss(dataToReturn);

  }
}
