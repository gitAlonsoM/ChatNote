//src\app\app.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular';               // DEBUG: modal controller import
import { CarpetaService } from './services/carpeta.service';    // DEBUG: carpeta service import
import { CarpetaCreatePage } from './carpeta-create/carpeta-create.page';  

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  private authSubscription: Subscription | null = null;

  carpetas: { id: number; nombre: string }[] = [];              // DEBUG: carpetas array


  constructor(
    private platform: Platform,
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,

    private modalCtrl: ModalController,                          // DEBUG: inyect modal controller
    private carpetaService: CarpetaService                       // DEBUG: inyect carpeta service
    // ======== End Modification ========
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
      }
    );

        this.loadCarpetas();                                         // DEBUG: carga las carpetas al iniciar

  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
     
    });
  }

  private async loadCarpetas() {
    console.debug('DEBUG: loading folders…');                   // DEBUG: log inicio
    this.carpetas = await this.carpetaService.listarCarpetas();
    console.debug('DEBUG: folders loaded', this.carpetas);      // DEBUG: log resultado
  }

  async openCreateFolderModal() {
    console.debug('DEBUG: opening create-folder modal');        // DEBUG: antes de abrir
    const modal = await this.modalCtrl.create({
      component: CarpetaCreatePage,         // << Aquí cambiamos
        componentProps: {}
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data?.refrescar) {
      await this.loadCarpetas();
    }
    console.debug('DEBUG: modal dismissed, refreshed?', data?.refrescar);
  }

  // Método para desconectarse
  async logout() {
    try {
      await this.authService.logout();
      const toast = await this.toastController.create({
        message: 'Desconectado exitosamente',
        duration: 2000,
        position: 'top',
      });
      toast.present();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al desconectarse', error);
    }
  }
}
