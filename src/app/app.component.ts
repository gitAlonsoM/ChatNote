// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, ToastController, ModalController, MenuController } from '@ionic/angular'; // Asegúrate que ModalController y MenuController estén aquí
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';
// import { CarpetaService } from './services/carpeta.service'; // No es necesario aquí si solo abres el modal
import { CarpetaCreatePage } from './carpeta-create/carpeta-create.page'; // Importa la página del modal
import { CarpetaService, Carpeta } from './services/carpeta.service'; // Importar CarpetaService y la interfaz Carpeta


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  // styleUrls: ['app.component.scss'], // Si tienes estilos específicos para app.component
})
export class AppComponent implements OnInit, OnDestroy {
  public isLoggedIn: boolean = false; // Hacerla pública para que la plantilla la pueda usar
  private authSubscription: Subscription | null = null;
  public carpetas: Carpeta[] = []; // Para almacenar y mostrar las carpetas en el menú
  public isLoadingCarpetas: boolean = false; // Para feedback visual (opcional)

  constructor(
    private platform: Platform,
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController, // Mantener si lo usas directamente aquí
    private menuCtrl: MenuController,
    private modalCtrl: ModalController,
    private carpetaService: CarpetaService // Inyectar CarpetaService
  ) {
    console.log('[AppComponent] Constructor: Componente raíz instanciado.');
    this.initializeApp();
  }

 
  ngOnInit() {
    console.log('[AppComponent] ngOnInit.');
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (loggedInStatus) => {
        this.isLoggedIn = loggedInStatus;
        console.log('[AppComponent] Estado isLoggedIn actualizado:', this.isLoggedIn);
        if (this.isLoggedIn) {
          this.cargarCarpetasPersonales(); // Cargar carpetas cuando el usuario inicia sesión
        } else {
          this.carpetas = []; // Limpiar carpetas si el usuario cierra sesión
          console.log('[AppComponent] Usuario cerró sesión, lista de carpetas limpiada.');
        }
      },
      (error) => console.error('[AppComponent] Error en isLoggedIn$ subscription:', error)
    );
  }

  initializeApp() {
    this.platform.ready().then(() => {
      console.log('[AppComponent] initializeApp: Plataforma lista.');
    });
  }

   async cargarCarpetasPersonales() {
    if (!this.isLoggedIn) {
      console.log('[AppComponent] cargarCarpetasPersonales: Usuario no logueado, no se cargan carpetas.');
      return;
    }
    console.log('[AppComponent] cargarCarpetasPersonales: Solicitando lista de carpetas...');
    this.isLoadingCarpetas = true;
    this.carpetaService.listPersonalFolders().subscribe({
      next: (carpetasRecibidas) => {
        this.carpetas = carpetasRecibidas;
        this.isLoadingCarpetas = false;
        console.log('[AppComponent] Carpetas personales cargadas/actualizadas:', this.carpetas);
      },
      error: (error) => {
        this.isLoadingCarpetas = false;
        console.error('[AppComponent] Error al cargar carpetas personales:', error);
        this.showCustomToast('Error al cargar tus carpetas.', 'danger');
        this.carpetas = []; // Asegurar que esté vacía en caso de error
      }
    });
  }

    async openCreateFolderModal() {
    console.log('[AppComponent] openCreateFolderModal. LoggedIn:', this.isLoggedIn);
    if (!this.isLoggedIn) {
      // ... (lógica existente) ...
      console.warn('[AppComponent] Usuario no logueado.');
      await this.showCustomToast('Debes iniciar sesión para crear carpetas.', 'warning');
      this.router.navigate(['/login']);
      await this.closeCurrentMenu();
      return;
    }
    await this.closeCurrentMenu();
    const modal = await this.modalCtrl.create({ component: CarpetaCreatePage });
    modal.onDidDismiss().then((result) => {
      console.log('[AppComponent] Modal de creación CERRADO. Role:', result.role, 'Data:', result.data);
      if (result.role === 'confirm' && result.data && result.data.created) {
        console.log('[AppComponent] Carpeta creada (modal):', result.data.folderName);
        this.showCustomToast(`Carpeta "${result.data.folderName}" creada.`, 'success');
        this.cargarCarpetasPersonales(); // <-- RECARGAR CARPETAS DESPUÉS DE CREAR UNA NUEVA
      }
    });
    return await modal.present();
  }

  async closeCurrentMenu() {
    const menu = await this.menuCtrl.getOpen(); // Obtiene el menú que esté abierto
    if (menu) {
      console.log(`[AppComponent] closeCurrentMenu: Cerrando menú con ID: ${menu.menuId}`);
      await this.menuCtrl.close(menu.menuId);
    } else {
      console.log('[AppComponent] closeCurrentMenu: No hay menú abierto para cerrar.');
    }
  }

  // Método para desconectarse
  async logout() {
    console.log('[AppComponent] logout: Intentando cerrar sesión.');
    await this.closeCurrentMenu(); // Cerrar menú antes
    try {
      await this.authService.logout(); // AuthService se encarga de la lógica de Firebase y redirección
      // El toast de logout ya lo maneja el AuthService
      // this.router.navigate(['/login']); // AuthService debería manejar la redirección
    } catch (error) {
      console.error('[AppComponent] Error durante el proceso de logout:', error);
      await this.showCustomToast('Error al intentar cerrar sesión.', 'danger');
    }
  }

  // Helper para mostrar toasts desde AppComponent si es necesario
  private async showCustomToast(message: string, color: string = 'primary', duration: number = 2500) {
    const toast = await this.toastController.create({
      message,
      duration: duration,
      color: color,
      position: 'top'
    });
    toast.present();
  }

  ngOnDestroy() {
    console.log('[AppComponent] ngOnDestroy: Desuscribiéndose del estado de autenticación.');
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

 async abrirCarpeta(carpeta: Carpeta) {
    await this.closeCurrentMenu();
    console.log(`[AppComponent] Navegando a carpeta: ${carpeta.nombre} (ID: ${carpeta.carpeta_id})`);
    // Navegar a la nueva ruta, pasando el carpeta_id como parámetro
    this.router.navigate(['/carpeta', carpeta.carpeta_id]);
  }


}