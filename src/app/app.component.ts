//src\app\app.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Platform, ToastController, ModalController, MenuController } from '@ionic/angular';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subscription, Subject } from 'rxjs'; 
import { filter, takeUntil, tap, distinctUntilChanged } from 'rxjs/operators';
import { CarpetaCreatePage } from './carpeta-create/carpeta-create.page';
import { CarpetaService, Carpeta } from './services/carpeta.service';
import { WorkspaceService, Workspace } from './services/workspace.service'; 
import { WorkspaceCreatePage } from './modals/workspace-create/workspace-create.page'; 
import { InvitationService, Invitation } from './services/invitation.service';
import { InvitationsManagerPage } from './modals/invitations-manager/invitations-manager.page';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  public isLoggedIn: boolean = false;
  private authSubscription: Subscription | null = null;
  private routerEventsSubscription: Subscription | null = null;
  private ngUnsubscribe = new Subject<void>();
  public carpetas: Carpeta[] = [];
  public isLoadingCarpetas: boolean = false;

  public pendingInvitations: Invitation[] = [];
  public isLoadingInvitations: boolean = false;
  
  public userWorkspaces: Workspace[] = []; 
  public isLoadingWorkspaces: boolean = false; 

  constructor(
    private platform: Platform,
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private menuCtrl: MenuController,
    private modalCtrl: ModalController,
    private carpetaService: CarpetaService,
    private cdr: ChangeDetectorRef,
    private workspaceService: WorkspaceService,
    private invitationService: InvitationService
  ) {
    console.log('[AppComponent] Constructor: Componente raíz instanciado.');
    this.initializeApp();
  }

  ngOnInit() {
    console.log('DEBUG: [AppComponent] ngOnInit called.');


    this.authSubscription = this.authService.isLoggedIn$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(async (loggedInStatus) => {
        this.isLoggedIn = loggedInStatus;
        console.log(`DEBUG: [AppComponent] isLoggedIn$ status changed to: ${this.isLoggedIn}. Current URL: ${this.router.url}`); // DEBUG: Cambio de estado de login
        this.cdr.detectChanges();

        if (this.isLoggedIn) {
          console.log('DEBUG: [AppComponent] User is logged in. Setting up data loading and router listeners.'); // DEBUG: Usuario logueado
          this.setupDataLoadingOnLoginAndNavigation();

          if (!this.router.url.startsWith('/espacio/')) {
             await this.loadAllUserDataForMenu();
          }

        } else {
          console.log('DEBUG: [AppComponent] User is logged out or initial state is not logged in.'); // DEBUG: Usuario no logueado
          this.clearUserDataForMenu(); 
          if (this.router.url !== '/' && !this.isAuthPage(this.router.url)) { // Uso de this.isAuthPage
              console.log(`DEBUG: [AppComponent] Not logged in, redirecting from ${this.router.url} to /login.`); // DEBUG: Redirección a login
              this.router.navigate(['/login'], { replaceUrl: true });
          }}
        },
      (error) => {
        console.error('[AppComponent] Error en isLoggedIn$ subscription:', error);
        console.error('DEBUG: [AppComponent] Error in isLoggedIn$ subscription:', error);
      }
    );
  }

    private clearUserDataForMenu() {
      this.carpetas = [];
      this.isLoadingCarpetas = false;
      this.userWorkspaces = []; 
      this.isLoadingWorkspaces = false; 
      this.pendingInvitations = [];
      this.isLoadingInvitations = false;

      console.log('DEBUG: [AppComponent] User data for menu CLEARED.'); 
      this.cdr.detectChanges();
  }
  

  private isValidAppUrl(url: string): boolean {
    const isValid = url !== '/' && !url.includes('/login') && !url.includes('/register');
    return isValid;
  }
  
  private isAuthPage(url: string): boolean {
    const isAuth = url.includes('/login') || url.includes('/register');
    return isAuth;
  }

  private setupDataLoadingOnLoginAndNavigation() {
    if (this.routerEventsSubscription) {
      this.routerEventsSubscription.unsubscribe();
      console.log('DEBUG: [AppComponent] Previous router subscription unsubscribed.'); // DEBUG: Desuscripción previa
    }
    this.routerEventsSubscription = this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(async (navEndEvent: NavigationEnd) => {
      console.log(`DEBUG: [AppComponent] NavigationEnd to: ${navEndEvent.urlAfterRedirects}. User isLoggedIn: ${this.isLoggedIn}`); // DEBUG: Evento de navegación
      
      // Solo cargar datos del menú si el usuario está logueado y NO está navegando DENTRO de un espacio colaborativo
      if (this.isLoggedIn && !navEndEvent.urlAfterRedirects.startsWith('/espacio/')) {
        console.log('DEBUG: [AppComponent] Navigation to a non-workspace page while logged in. Reloading menu data.'); // DEBUG: Carga de datos para menú
        await this.loadAllUserDataForMenu();
      } else if (this.isLoggedIn && navEndEvent.urlAfterRedirects.startsWith('/espacio/')) {
        console.log('DEBUG: [AppComponent] Navigation within a workspace. Main menu data NOT reloaded.'); // DEBUG: Navegación dentro de workspace
      }
    });


    if (this.isLoggedIn && !this.router.url.startsWith('/espacio/')) {
        console.log(`DEBUG: [AppComponent] Initial check: User logged in on ${this.router.url}. Loading menu data.`); // DEBUG: Carga inicial de datos
        this.loadAllUserDataForMenu();
    }
  }

  private async loadAllUserDataForMenu() {
      if (!this.isLoggedIn) {
          console.log('DEBUG: [AppComponent] loadAllUserDataForMenu skipped: User not logged in.'); // DEBUG: Omitido por no estar logueado
          return;
      }
      console.log('DEBUG: [AppComponent] loadAllUserDataForMenu - Starting to load folders and workspaces for menu.'); // DEBUG: Inicio de carga de datos del menú
      

      try {
        await Promise.all([
            this.cargarCarpetasPersonales(),
            this.cargarEspaciosColaborativos(),
            this.loadPendingInvitations() // Add invitation loading
        ]);
        console.log('DEBUG: [AppComponent] loadAllUserDataForMenu - Both folders and workspaces loading initiated/completed.'); // DEBUG: Carga iniciada/completada
      } catch (error: any) {
        console.error('DEBUG: [AppComponent] loadAllUserDataForMenu - Error during Promise.all:', error.message); // DEBUG: Error en Promise.all
      }
      this.cdr.detectChanges(); 
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
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        this.isLoadingCarpetas = false;
        console.error('[AppComponent] Error al cargar carpetas personales:', error);
        this.cdr.detectChanges(); 

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


  async cargarEspaciosColaborativos() {
    if (!this.isLoggedIn || this.isLoadingWorkspaces) return;
    console.log('DEBUG: [AppComponent] cargarEspaciosColaborativos: Solicitando lista de espacios...');
    this.isLoadingWorkspaces = true;
    this.cdr.detectChanges();

    this.workspaceService.listUserWorkspaces().pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: (workspacesRecibidos) => {
        this.userWorkspaces = workspacesRecibidos;
        this.isLoadingWorkspaces = false;
        console.log('DEBUG: [AppComponent] Espacios colaborativos cargados/actualizados:', this.userWorkspaces.length);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoadingWorkspaces = false;
        this.userWorkspaces = [];
        console.error('DEBUG: [AppComponent] Error al cargar espacios colaborativos:', error);
        

        if (this.isValidAppUrl(this.router.url) && !this.isAuthPage(this.router.url)) {
             this.showCustomToast('Error al cargar tus espacios colaborativos.', 'danger');
        }
        this.cdr.detectChanges();
      }
    });
  }

  async loadPendingInvitations() {
    if (!this.isLoggedIn || this.isLoadingInvitations) return;
    this.isLoadingInvitations = true;
    this.cdr.detectChanges();

    this.invitationService.getPendingInvitations().pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: (invitations: Invitation[]) => {
        this.pendingInvitations = invitations;
        this.isLoadingInvitations = false;
        console.log(`DEBUG: [AppComponent] Pending invitations loaded: ${invitations.length}`);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoadingInvitations = false;
        this.pendingInvitations = [];
        console.error('DEBUG: [AppComponent] Error loading pending invitations:', err);
        // Do not show toast for this, it's less critical than workspaces/folders
        this.cdr.detectChanges();
      }
    });
  }

  async openInvitationsModal() {
    await this.closeCurrentMenu();
    const modal = await this.modalCtrl.create({
      component: InvitationsManagerPage
    });
    modal.onDidDismiss().then(async (result) => {
      // If an invitation was accepted or rejected, reload all data
      if (result.role === 'confirm' && result.data && result.data.reloaded) {
        console.log('DEBUG: [AppComponent] Invitation modal closed, reloading all user data.');
        await this.loadAllUserDataForMenu();
      }
    });
    return await modal.present();
  }


  async openCreateWorkspaceModal() {
    console.log('DEBUG: [AppComponent] openCreateWorkspaceModal. LoggedIn:', this.isLoggedIn);
    if (!this.isLoggedIn) {
      await this.showCustomToast('Debes iniciar sesión para crear espacios.', 'warning');
      this.router.navigate(['/login']);
      await this.closeCurrentMenu();
      return;
    }
    await this.closeCurrentMenu();
    const modal = await this.modalCtrl.create({
      component: WorkspaceCreatePage 
    });
    modal.onDidDismiss().then(async (result) => {
      console.log('DEBUG: [AppComponent] Modal de creación de ESPACIO CERRADO. Role:', result.role, 'Data:', result.data);


      if (result.role === 'confirm' && result.data && result.data.created) {
        this.showCustomToast(`Espacio "${result.data.workspaceName}" creado.`, 'success');
        await this.cargarEspaciosColaborativos(); 
      }
    });
    return await modal.present();
  }

  async navigateToWorkspace(workspace: Workspace) {
    await this.closeCurrentMenu();
    console.log(`DEBUG: [AppComponent] Navegando a espacio colaborativo: ${workspace.nombre} (ID: ${workspace.espacio_id})`);

    this.router.navigate(['/espacio', workspace.espacio_id]);
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
    console.log('DEBUG;... openCreateFolderModal ');

    await this.closeCurrentMenu();
    const modal = await this.modalCtrl.create({ component: CarpetaCreatePage });



 modal.onDidDismiss().then((result) => {
      // Added detailed DEBUG logs and ensured UI refresh.
      console.log('DEBUG: AppComponent - Modal de creación PERSONAL CERRADO. Role:', result.role, 'Data:', result.data);
      
        if (result.role === 'confirm' && result.data?.created) {
        const folderName = result.data.folderName;
        
        console.log(`DEBUG: AppComponent - Llamando a carpetaService.createPersonalFolder con nombre: "${folderName}"`);
        
        this.carpetaService.createPersonalFolder(folderName).subscribe({
            next: (response) => {
              // Assuming backend returns a structure like { success: true, message: "..." }
              // Adjust if your backend returns something different on 201 Created.
              // For now, we'll assume any successful HTTP response (2xx) means success.
              console.log('DEBUG: subscribe() next - Creación de carpeta exitosa. Respuesta:', response);
              this.showCustomToast(`Carpeta "${folderName}" creada con éxito.`, 'success');
              
              // THIS IS THE FIX: Explicitly reload the folder list to refresh the UI.
              console.log('DEBUG: subscribe() next - Llamando a cargarCarpetasPersonales() para refrescar el menú.');
              this.cargarCarpetasPersonales(); 
            },
            error: (err) => {
              console.error('DEBUG: subscribe() error - Error al crear carpeta:', err);
              const errorMessage = err.error?.message || err.message || 'Error desconocido al crear la carpeta.';
              this.showCustomToast(errorMessage, 'danger');
            }
        });
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

   public logCurrentFolders(): void {
    console.log('DEBUG: [MENU WILL OPEN] Current state of this.carpetas:', JSON.parse(JSON.stringify(this.carpetas)));
  }

}