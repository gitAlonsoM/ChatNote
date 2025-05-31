//src\app\app.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Platform, ToastController, ModalController, MenuController } from '@ionic/angular';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router'; // Importar RouterEvent
import { AuthService } from './services/auth.service';
import { Subscription, Subject } from 'rxjs'; // Subject ya estaba, Subscription también
import { filter, takeUntil, tap } from 'rxjs/operators'; // tap puede ser útil para logs si es necesario

import { CarpetaCreatePage } from './carpeta-create/carpeta-create.page';
import { CarpetaService, Carpeta } from './services/carpeta.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  // styleUrls: ['app.component.scss'], // No es necesario
})
export class AppComponent implements OnInit, OnDestroy {
  public isLoggedIn: boolean = false;
  private authSubscription: Subscription | null = null;
  private routerEventsSubscription: Subscription | null = null; // Renombrado para claridad
  private ngUnsubscribe = new Subject<void>();
  public carpetas: Carpeta[] = [];
  public isLoadingCarpetas: boolean = false;

  constructor(
    private platform: Platform,
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private menuCtrl: MenuController,
    private modalCtrl: ModalController,
    private carpetaService: CarpetaService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('[AppComponent] Constructor: Componente raíz instanciado.');
    this.initializeApp();
  }

  ngOnInit() {
    console.log('DEBUG: [AppComponent] ngOnInit called.');
    this.authSubscription = this.authService.isLoggedIn$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(async (loggedInStatus) => {
        console.log(`DEBUG: [AppComponent] isLoggedIn$ emitted: ${loggedInStatus}. Current URL (at emission time): ${this.router.url}`);
        const previousIsLoggedIn = this.isLoggedIn;
        this.isLoggedIn = loggedInStatus;
        console.log('[AppComponent] Estado isLoggedIn actualizado:', this.isLoggedIn);
        this.cdr.detectChanges(); // Forzar detección de cambios

        // Cancelar suscripción anterior al router si existe
        if (this.routerEventsSubscription) {
          console.log('DEBUG: [AppComponent] Unsubscribing from previous router events.');
          this.routerEventsSubscription.unsubscribe();
          this.routerEventsSubscription = null;
        }

        if (this.isLoggedIn) {
          console.log('DEBUG: [AppComponent] User is logged in. Setting up router subscription for folder loading.');
          // Si el usuario está logueado, escuchar eventos de navegación
          this.routerEventsSubscription = this.router.events.pipe(
            filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd), // Filtrar y asegurar el tipo
            takeUntil(this.ngUnsubscribe)
          ).subscribe(async (navEndEvent: NavigationEnd) => { // Ahora navEndEvent es correctamente tipado como NavigationEnd
            console.log(`DEBUG: [AppComponent] NavigationEnd event. New URL: ${navEndEvent.urlAfterRedirects}`);
            const currentUrl = navEndEvent.urlAfterRedirects;
            const isLoginPage = currentUrl.includes('/login');
            const isRegisterPage = currentUrl.includes('/register');

            console.log(`DEBUG: [AppComponent] RouterEvent: currentUrl: ${currentUrl}, isLoginPage: ${isLoginPage}, isRegisterPage: ${isRegisterPage}`);

            if (!isLoginPage && !isRegisterPage) {
              console.log('DEBUG: [AppComponent] RouterEvent: Conditions met (logged in and not on login/register). Calling cargarCarpetasPersonales().');
              await this.cargarCarpetasPersonales();
            } else {
              console.log('DEBUG: [AppComponent] RouterEvent: Logged in but on login/register page. Not loading folders based on this navigation event.');
            }
          });

          // Intento de carga inicial si ya estamos en una ruta válida y el estado de login acaba de cambiar a true
          const initialUrl = this.router.url; // URL en el momento de la emisión de isLoggedIn$
          if (previousIsLoggedIn === false && loggedInStatus === true && !initialUrl.includes('/login') && !initialUrl.includes('/register')) {
            console.log('DEBUG: [AppComponent] isLoggedIn$ changed to true and initial URL is valid. Attempting immediate folder load.');
            await this.cargarCarpetasPersonales();
          }

        } else {
          this.carpetas = [];
          this.isLoadingCarpetas = false;
          console.log('[AppComponent] Usuario cerró sesión, lista de carpetas limpiada.');
          console.log('DEBUG: [AppComponent] User is NOT logged in.');
          this.cdr.detectChanges();

          const currentUrl = this.router.url;
          if (!currentUrl.includes('/login') && !currentUrl.includes('/register')) {
            await this.router.navigate(['/login'], { replaceUrl: true });
          }
        }
      },
      (error) => {
        console.error('[AppComponent] Error en isLoggedIn$ subscription:', error);
        console.error('DEBUG: [AppComponent] Error in isLoggedIn$ subscription:', error);
      }
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
    // Prevenir múltiples llamadas si ya se está cargando
    if (this.isLoadingCarpetas) {
        console.log('DEBUG: [AppComponent] cargarCarpetasPersonales: Ya se están cargando las carpetas, omitiendo nueva llamada.');
        return;
    }
    console.log('[AppComponent] cargarCarpetasPersonales: Solicitando lista de carpetas...');
    this.isLoadingCarpetas = true;
    this.cdr.detectChanges(); // Actualizar UI para mostrar spinner

    // Usamos takeUntil aquí también por si el usuario cierra sesión mientras se cargan las carpetas
    this.carpetaService.listPersonalFolders().pipe(
        takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: (carpetasRecibidas) => {
        this.carpetas = carpetasRecibidas;
        this.isLoadingCarpetas = false;
        console.log('[AppComponent] Carpetas personales cargadas/actualizadas:', this.carpetas);
        this.cdr.detectChanges(); // Actualizar UI con las carpetas
      },
      error: (error) => {
        this.isLoadingCarpetas = false;
        console.error('[AppComponent] Error al cargar carpetas personales:', error);
        this.cdr.detectChanges(); // Actualizar UI para ocultar spinner

        const currentUrl = this.router.url;
        const isLoginPage = currentUrl.includes('/login');
        const isRegisterPage = currentUrl.includes('/register');

        if (!isLoginPage && !isRegisterPage) {
          this.showCustomToast('Error al cargar tus carpetas.', 'danger');
        } else {
          console.log('[AppComponent] Error de carga de carpetas ignorado en página de login/registro para evitar toast redundante.');
        }
        this.carpetas = [];
      }
    });
  }

  async openCreateFolderModal() {
    console.log('[AppComponent] openCreateFolderModal. LoggedIn:', this.isLoggedIn);
    if (!this.isLoggedIn) {
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
        this.cargarCarpetasPersonales(); // Volver a cargar para incluir la nueva
      }
    });
    return await modal.present();
  }

  async closeCurrentMenu() {
    const menu = await this.menuCtrl.getOpen();
    if (menu) {
      console.log(`[AppComponent] closeCurrentMenu: Cerrando menú con ID: ${menu.menuId}`);
      await this.menuCtrl.close(menu.menuId);
    } else {
      console.log('[AppComponent] closeCurrentMenu: No hay menú abierto para cerrar.');
    }
  }

  async logout() {
    console.log('[AppComponent] logout: Intentando cerrar sesión.');
    await this.closeCurrentMenu();
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('[AppComponent] Error durante el proceso de logout:', error);
      await this.showCustomToast('Error al intentar cerrar sesión.', 'danger');
    }
  }

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
    console.log('[AppComponent] ngOnDestroy: Desuscribiéndose.');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    // Aunque takeUntil debería manejar estas suscripciones, es una buena práctica
    // adicional desuscribirse explícitamente si las referencias directas existen.
    // Sin embargo, con takeUntil(this.ngUnsubscribe) en cada pipe,
    // la desuscripción explícita de authSubscription y routerEventsSubscription
    // aquí podría ser redundante, pero no dañina.
    if (this.authSubscription) {
        this.authSubscription.unsubscribe();
    }
    if (this.routerEventsSubscription) {
        this.routerEventsSubscription.unsubscribe();
    }
  }

  async abrirCarpeta(carpeta: Carpeta) {
    await this.closeCurrentMenu();
    console.log(`[AppComponent] Navegando a carpeta: ${carpeta.nombre} (ID: ${carpeta.carpeta_id})`);
    this.router.navigate(['/carpeta', carpeta.carpeta_id]);
  }
}