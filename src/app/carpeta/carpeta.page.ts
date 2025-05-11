// src/app/carpeta/carpeta.page.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // <--- Router AÑADIDO
import { NavController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { NotaService, Nota } from '../services/nota.service';
import { CarpetaService } from '../services/carpeta.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators'; // switchMap no se usa directamente aquí ahora

@Component({
  selector: 'app-carpeta',
  templateUrl: './carpeta.page.html',
  styleUrls: ['./carpeta.page.scss'],
})
export class CarpetaPage implements OnInit, OnDestroy {
  carpetaId: number | null = null;
  nombreCarpeta: string = 'Cargando...';
  notas: Nota[] = [];
  isLoading: boolean = false;
  nuevaNotaContenido: string = '';

  private routeSubscription: Subscription | undefined;
  private currentUserUid: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router, // <--- Router INYECTADO
    private navCtrl: NavController,
    private notaService: NotaService,
    private carpetaService: CarpetaService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private cdr: ChangeDetectorRef
  ) {
    console.log('[CarpetaPage] Constructor');
    const user = this.authService.getCurrentUser();
    this.currentUserUid = user ? user.uid : null;
  }

  trackNotaById(index: number, nota: Nota): number {
    return nota.nota_id;
  }

  ngOnInit() {
    console.log('[CarpetaPage] ngOnInit');
    // isLoading se maneja en cargarDatosIniciales y cargarNotas
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && this.currentUserUid) {
        this.carpetaId = +id;
        console.log(`[CarpetaPage] carpetaId: ${this.carpetaId}, currentUserUid: ${this.currentUserUid}`);
        this.cargarDatosIniciales();
      } else {
        console.error('[CarpetaPage] No se encontró el ID de la carpeta o UID del usuario.');
        this.presentToast('Error: No se pudo identificar la carpeta o el usuario.', 'danger');
        this.goBack(); // Usar goBack para manejar la navegación atrás
      }
    });
  }

  async cargarDatosIniciales() {
    if (!this.carpetaId) return;
    this.isLoading = true; // Indicar carga
    console.log('[CarpetaPage] Cargando datos iniciales...');

    this.carpetaService.listPersonalFolders().subscribe(
      todasLasCarpetas => {
        const carpetaActual = todasLasCarpetas.find(c => c.carpeta_id === this.carpetaId);
        this.nombreCarpeta = carpetaActual ? carpetaActual.nombre : 'Carpeta no encontrada';
        console.log(`[CarpetaPage] Nombre de carpeta: ${this.nombreCarpeta}`);
        if (!carpetaActual) {
            this.presentToast('La carpeta solicitada no existe o no tienes acceso.', 'warning');
        }
      },
      error => {
        console.error('[CarpetaPage] Error al cargar lista de carpetas para obtener nombre:', error);
        this.nombreCarpeta = 'Error al cargar nombre';
      }
    );

    // Cargar notas (esto ya pone isLoading a false al finalizar)
    this.cargarNotas(false); // No mostrar el spinner global de nuevo si ya está activo por datos iniciales
  }

  async cargarNotas(mostrarSpinnerGlobal: boolean = true) {
    if (!this.carpetaId) {
      console.warn('[CarpetaPage] cargarNotas llamado sin carpetaId.');
      if(mostrarSpinnerGlobal) this.isLoading = false; // Asegurar que se quite el spinner si se llama sin ID
      return;
    }
    if (mostrarSpinnerGlobal) this.isLoading = true;
    console.log(`[CarpetaPage] Cargando notas para carpetaId ${this.carpetaId}`);

    this.notaService.getNotesForFolder(this.carpetaId).pipe(
      finalize(() => {
        if (mostrarSpinnerGlobal) this.isLoading = false;
        this.cdr.detectChanges();
        console.log('[CarpetaPage] Carga de notas finalizada.');
      })
    ).subscribe({
      next: notasRecibidas => {
        this.notas = notasRecibidas.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
        console.log(`[CarpetaPage] Notas cargadas y ordenadas:`, this.notas);
      },
      error: err => {
        console.error(`[CarpetaPage] Error al cargar notas:`, err);
        this.presentToast('Error al cargar las notas.', 'danger');
      }
    });
  }

  async mostrarLoading(mensaje: string = 'Procesando...') {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner: 'crescent',
      translucent: true, // Para mejor apariencia
    });
    await loading.present();
    return loading;
  }

  async crearNota() {
    if (!this.nuevaNotaContenido.trim()) {
      this.presentToast('El contenido de la nota no puede estar vacío.', 'warning');
      return;
    }
    if (!this.carpetaId) { // Ya no necesitamos currentUserUid aquí, el servicio lo obtiene
      this.presentToast('Error: No se pudo identificar la carpeta.', 'danger');
      return;
    }

    console.log('[CarpetaPage] crearNota. Contenido:', this.nuevaNotaContenido);
    const loading = await this.mostrarLoading('Creando nota...');

    this.notaService.crearNota(this.carpetaId, this.nuevaNotaContenido.trim()).pipe(
      finalize(() => loading.dismiss())
    ).subscribe({
      next: (response) => {
        console.log('[CarpetaPage] Nota creada, respuesta:', response);
        this.presentToast('Nota creada exitosamente.', 'success');
        this.nuevaNotaContenido = '';
        this.cargarNotas(false);
      },
      error: (error) => {
        console.error('[CarpetaPage] Error al crear nota:', error);
        this.presentToast(`Error al crear la nota: ${error.message || 'Error desconocido'}`, 'danger');
      }
    });
  }

  async editarNota(nota: Nota) {
    console.log('[CarpetaPage] editarNota para:', nota);
    const alert = await this.alertCtrl.create({
      header: 'Editar Nota',
      cssClass: 'custom-alert', // Para estilos personalizados si necesitas
      inputs: [
        {
          name: 'contenidoNota',
          type: 'textarea',
          value: nota.contenido,
          placeholder: 'Escribe el nuevo contenido aquí...'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel' },
        {
          text: 'Guardar',
          cssClass: 'alert-button-confirm',
          handler: async (data) => {
            const nuevoContenido = data.contenidoNota ? data.contenidoNota.trim() : '';
            if (nuevoContenido && nuevoContenido !== nota.contenido) {
              console.log(`[CarpetaPage] Guardando edición. Nuevo contenido: "${nuevoContenido}"`);
              const loading = await this.mostrarLoading('Actualizando nota...');
              this.notaService.actualizarNota(nota.nota_id, nuevoContenido).pipe(
                finalize(() => loading.dismiss())
              ).subscribe({
                next: () => {
                  this.presentToast('Nota actualizada.', 'success');
                  this.cargarNotas(false);
                },
                error: (err) => {
                  this.presentToast(`Error al actualizar la nota: ${err.message || 'Error desconocido'}`, 'danger');
                }
              });
            } else if (!nuevoContenido) {
                this.presentToast('El contenido no puede estar vacío.', 'warning');
                return false; // Evita que el alert se cierre si la validación falla
            } else {
                console.log('[CarpetaPage] Edición cancelada o sin cambios.');
                return true;
            }
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminarNota(nota: Nota) {
    console.log('[CarpetaPage] eliminarNota para:', nota);
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Eliminar la nota "${nota.contenido.substring(0, 30).trim()}..."?`,
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'alert-button-destructive',
          handler: async () => {
            console.log(`[CarpetaPage] Confirmada eliminación de notaId: ${nota.nota_id}`);
            const loading = await this.mostrarLoading('Eliminando nota...');
            this.notaService.eliminarNota(nota.nota_id).pipe(
              finalize(() => loading.dismiss())
            ).subscribe({
              next: () => {
                this.presentToast('Nota eliminada.', 'success');
                this.cargarNotas(false);
              },
              error: (err) => {
                this.presentToast(`Error al eliminar la nota: ${err.message || 'Error desconocido'}`, 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' | 'secondary' | 'tertiary' = 'primary', duration: number = 3000) {
    const toast = await this.toastCtrl.create({ message, duration, color, position: 'top', translucent: true });
    toast.present();
  }

  
  goBack() {
    console.log('[CarpetaPage] goBack: Intentando navegar hacia atrás.');
    
    this.navCtrl.navigateBack('/chat', { animated: true });
    
    try {
      
        console.log('[CarpetaPage] navCtrl.back() llamado.');


    } catch (e) {
        console.warn('[CarpetaPage] navCtrl.back() falló o no había historial, usando Router para /chat:', e);
        this.router.navigate(['/chat']);
    }
    // La forma más recomendada con NavController cuando tienes un defaultHref es:
    // this.navCtrl.navigateBack('/chat'); // O la ruta que desees
  }
   ngOnDestroy() {
    console.log('[CarpetaPage] ngOnDestroy');
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}