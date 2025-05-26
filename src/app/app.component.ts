// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, ToastController, ModalController, MenuController } from '@ionic/angular'; 
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';
// import { CarpetaService } from './services/carpeta.service'; // No es necesario importarlo si solo abres el modal
import { CarpetaCreatePage } from './carpeta-create/carpeta-create.page'; // Importa la página del modal
import { CarpetaService, Carpeta } from './services/carpeta.service'; 

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  // styleUrls: ['app.component.scss'], // No es necesario
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
    private toastController: ToastController, 
    private menuCtrl: MenuController,
    private modalCtrl: ModalController,
    private carpetaService: CarpetaService // Inyectar CarpetaService
  ) {
    console.log('[AppComponent] Constructor: Componente raíz instanciado.');
    this.initializeApp();
  }

  
  ngOnInit() {
    console.log('[AppComponent] ngOnInit.');
    // Marcamos el callback del subscribe como async para poder usar await dentro.
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      async (loggedInStatus) => { 
        this.isLoggedIn = loggedInStatus;
        console.log('[AppComponent] Estado isLoggedIn actualizado:', this.isLoggedIn);

        // *** CAMBIO CLAVE AQUÍ: Solo cargar carpetas si el usuario está logueado
        // *** Y la URL actual NO es la página de login o registro.
        // *** Esto evita llamadas a la API sin autenticar cuando la app se carga por primera vez
        // *** y aterriza en /login o /register.
        const currentUrl = this.router.url;
        const isLoginPage = currentUrl.includes('/login');
        const isRegisterPage = currentUrl.includes('/register');

        if (this.isLoggedIn) {
          // Si el usuario está logueado, carga las carpetas.
          // Solo si NO estamos en la página de login/registro (que es donde se mostraría el error si falla)
          if (!isLoginPage && !isRegisterPage) {
            await this.cargarCarpetasPersonales(); // Cargar carpetas cuando el usuario inicia sesión
          } else {
            // Si el usuario está logueado pero estamos en login/registro, no hacer la carga.
            // Esto puede pasar si el usuario ya tiene sesión pero vuelve a la URL de login.
            console.log('[AppComponent] Usuario logueado pero en página de login/registro, no se cargan carpetas por ahora.');
          }
        } else {
          this.carpetas = []; // Limpiar carpetas si el usuario cierra sesión
          console.log('[AppComponent] Usuario cerró sesión, lista de carpetas limpiada.');
          // Si el usuario no está logueado y NO estamos ya en login/registro, redirigir
          if (!isLoginPage && !isRegisterPage) {
              await this.router.navigate(['/login'], { replaceUrl: true });
          }
        }
      },
      (error) => console.error('[AppComponent] Error en isLoggedIn$ subscription:', error)
    );
  }

  initializeApp() {
    this.platform.ready().then(() => {
      console.log('[AppComponent] initializeApp: Plataforma lista.');
      // Opcional: Aquí podrías llamar a un método en AuthService
      // para que verifique el estado de autenticación inicial de forma proactiva.
      // Por ejemplo: this.authService.checkInitialAuthStatus();
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
        
        // *** CAMBIO CLAVE AQUÍ: Solo mostrar el toast de error si no estamos en la página de login o registro.
        // *** Si estamos en login, el error de carga de carpetas es esperado antes de autenticarse
        // *** y no debe mostrar un toast que confunda al usuario.
        const currentUrl = this.router.url;
        const isLoginPage = currentUrl.includes('/login');
        const isRegisterPage = currentUrl.includes('/register');

        if (!isLoginPage && !isRegisterPage) {
          this.showCustomToast('Error al cargar tus carpetas.', 'danger');
        } else {
             // Si estamos en login/registro, el error de carga de carpetas puede ser normal
             // (ej. se intentó acceder a una ruta protegida sin autenticar)
             console.log('[AppComponent] Error de carga de carpetas ignorado en página de login/registro para evitar toast redundante.');
        }
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
        this.cargarCarpetasPersonales(); 
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
