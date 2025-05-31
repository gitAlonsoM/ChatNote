// src/app/carpeta/carpeta.page.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; 
import { NavController, AlertController, ToastController, LoadingController, ActionSheetController } from '@ionic/angular';
import { NotaService, Nota } from '../services/nota.service';
import { CarpetaService, RenameFolderErrorResponse } from '../services/carpeta.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators'; 
import { HttpErrorResponse } from '@angular/common/http'; 
import { ArchivoAdjuntoService, ArchivoAdjuntoInfo, UploadResponse } from '../services/archivo-adjunto.service'; 
import { saveAs } from 'file-saver'; 

@Component({
  selector: 'app-carpeta',
  templateUrl: './carpeta.page.html',
  styleUrls: ['./carpeta.page.scss'],
})
export class CarpetaPage implements OnInit, OnDestroy {
  carpetaId: number | null = null;
  nombreCarpeta: string = 'Cargando...';
  canManageFolder: boolean = false;
  notas: Nota[] = [];
  isLoading: boolean = false;
  nuevaNotaContenido: string = '';
  archivos: ArchivoAdjuntoInfo[] = [];
  isLoadingArchivos: boolean = false;
  nuevoArchivoNombre: string = '';
  nuevoArchivoDescripcion: string = '';
  archivoParaSubir: File | null = null;
  isUploadingFile: boolean = false;
  private routeSubscription: Subscription | undefined;
  private currentUserUid: string | null = null; // Se mantiene la propiedad para acceso posterior si es necesario

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private notaService: NotaService,
    private archivoAdjuntoService: ArchivoAdjuntoService,
    private carpetaService: CarpetaService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private cdr: ChangeDetectorRef,
    private actionSheetCtrl: ActionSheetController

  ) {
    console.log('[CarpetaPage] Constructor');
    // **AQUÍ NO SE ACCEDE A PROMESAS NI SE ASIGNAN VALORES ASÍNCRONOS.**
    // La inicialización asíncrona se realiza en ngOnInit.
  }

  trackNotaById(index: number, nota: Nota): number {
    return nota.nota_id;
  }

  async ngOnInit() { // ngOnInit ahora es asíncrono
    console.log('[CarpetaPage] ngOnInit');

    try {
      // Espera a que la promesa de getCurrentUser() se resuelva
      const user = await this.authService.getCurrentUser();
      this.currentUserUid = user ? user.uid : null;
      console.log('[CarpetaPage] UID del usuario actual obtenido en ngOnInit:', this.currentUserUid);

      // isLoading se maneja en cargarDatosIniciales y cargarNotas
      this.routeSubscription = this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id && this.currentUserUid) { // Asegúrate de que el UID esté disponible aquí
          this.carpetaId = +id;
          console.log(`[CarpetaPage] carpetaId: ${this.carpetaId}, currentUserUid: ${this.currentUserUid}`);
          this.cargarDatosIniciales();
        } else {
          console.error('[CarpetaPage] No se encontró el ID de la carpeta o UID del usuario en ngOnInit.');
          this.presentToast('Error: No se pudo identificar la carpeta o el usuario.', 'danger');
          this.goBack(); // Usar goBack para manejar la navegación atrás
        }
      });
    } catch (error) {
      console.error('[CarpetaPage] Error al obtener el usuario actual en ngOnInit:', error);
      this.presentToast('Error de autenticación. Por favor, inicia sesión de nuevo.', 'danger');
      // Podrías redirigir al usuario a la página de inicio de sesión aquí
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  // ---

  async cargarDatosIniciales() {
    if (!this.carpetaId) {
      console.warn('[CarpetaPage] cargarDatosIniciales - No folderId available.'); // DEBUG: Warning
      return;
    }
    this.isLoading = true;
    console.log('[CarpetaPage] Cargando datos iniciales...'); // DEBUG: Loading data

    // No se necesita currentUserUid aquí directamente, CarpetaService lo obtiene
    this.carpetaService.listPersonalFolders().subscribe(
      todasLasCarpetas => {
        const carpetaActual = todasLasCarpetas.find(c => c.carpeta_id === this.carpetaId);
        this.nombreCarpeta = carpetaActual ? carpetaActual.nombre : 'Carpeta no encontrada';
        console.log(`DEBUG: [CarpetaPage] cargarDatosIniciales - Nombre de la carpeta: "${this.nombreCarpeta}"`); // DEBUG: Folder name
        // Determinar si la carpeta actual es la carpeta "General" (comprobación que no distingue entre mayúsculas y minúsculas)
        // Y establecer canManageFolder en consecuencia.
        if (carpetaActual) {
          this.canManageFolder = carpetaActual.nombre.toLowerCase() !== 'general';
          console.log(`DEBUG: [CarpetaPage] cargarDatosIniciales - canManageFolder establecido en: ${this.canManageFolder} (esCarpetaGeneral: ${!this.canManageFolder})`); // DEBUG: Management status
        } else {
          this.canManageFolder = false; // Si no se encuentra la carpeta, no se puede gestionar.
          this.presentToast('La carpeta solicitada no existe o no tienes acceso.', 'warning');
          // Considera navegar hacia atrás si la carpeta realmente ha desaparecido, por ejemplo, this.goBack();
        }
        if (!carpetaActual) { // Esta parte podría ser redundante si se maneja arriba, pero se mantiene por seguridad.
          // this.presentToast('La carpeta solicitada no existe o no tienes acceso.', 'warning');
        }
        this.cdr.detectChanges(); // Asegurar que la UI se actualice
      },
      error => {
        console.error('[CarpetaPage] Error al cargar lista de carpetas para obtener nombre:', error); // DEBUG: Error
        this.nombreCarpeta = 'Error al cargar nombre';
        this.canManageFolder = false; // No se puede gestionar si hay un error al cargar el nombre
        this.cdr.detectChanges(); // Asegurar que la UI se actualice
      }
    );
    this.cargarNotas(false);
    this.cargarArchivos(false);
  }

  async cargarNotas(mostrarSpinnerGlobal: boolean = true) {
    if (!this.carpetaId) {
      console.warn('[CarpetaPage] cargarNotas llamado sin carpetaId.');
      if (mostrarSpinnerGlobal) this.isLoading = false;
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

  async cargarArchivos(mostrarSpinnerGlobal: boolean = true) {
    if (!this.carpetaId) {
      console.warn('DEBUG: [CarpetaPage] cargarArchivos llamado sin carpetaId.'); // DEBUG
      if (mostrarSpinnerGlobal) this.isLoadingArchivos = false;
      return;
    }
    if (mostrarSpinnerGlobal) this.isLoadingArchivos = true;
    console.log(`DEBUG: [CarpetaPage] Cargando archivos para carpetaId ${this.carpetaId}`); // DEBUG

    this.archivoAdjuntoService.getFilesForFolder(this.carpetaId).pipe(
      finalize(() => {
        if (mostrarSpinnerGlobal) this.isLoadingArchivos = false;
        this.cdr.detectChanges();
        console.log('DEBUG: [CarpetaPage] Carga de archivos finalizada.'); // DEBUG
      })
    ).subscribe({
      next: archivosRecibidos => {
        this.archivos = archivosRecibidos.sort((a, b) =>
          new Date(b.fecha_subida).getTime() - new Date(a.fecha_subida).getTime()
        ); // Ordenar por fecha de subida descendente
        console.log('DEBUG: [CarpetaPage] Archivos cargados y ordenados:', this.archivos); // DEBUG
      },
      error: err => {
        console.error('DEBUG: [CarpetaPage] Error al cargar archivos:', err); // DEBUG
        this.presentToast(`Error al cargar los archivos adjuntos: ${err.message || 'Error desconocido'}`, 'danger');
        this.isLoadingArchivos = false; // Asegurar que se quite el spinner en caso de error
      }
    });
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.archivoParaSubir = fileList[0];
      // Si el nombre del archivo está vacío, autocompletar con el nombre del archivo seleccionado (sin extensión)
      if (!this.nuevoArchivoNombre.trim() && this.archivoParaSubir) {
        this.nuevoArchivoNombre = this.archivoParaSubir.name.split('.').slice(0, -1).join('.');
      }
      console.log('DEBUG: [CarpetaPage] Archivo seleccionado:', this.archivoParaSubir.name); // DEBUG
    } else {
      this.archivoParaSubir = null;
    }
  }

  async subirArchivo() {
    if (!this.archivoParaSubir) {
      this.presentToast('Por favor, selecciona un archivo para subir.', 'warning');
      return;
    }
    if (!this.nuevoArchivoNombre.trim()) {
      this.presentToast('El nombre del archivo es obligatorio.', 'warning');
      return;
    }
    if (!this.carpetaId) {
      this.presentToast('Error: No se pudo identificar la carpeta de destino.', 'danger');
      return;
    }

    console.log(`DEBUG: [CarpetaPage] Intentando subir archivo: ${this.nuevoArchivoNombre}`); // DEBUG
    this.isUploadingFile = true; // Activar estado de subida
    const loading = await this.mostrarLoading('Subiendo archivo...');

    this.archivoAdjuntoService.uploadFile(
      this.carpetaId,
      this.archivoParaSubir,
      this.nuevoArchivoNombre.trim(),
      this.nuevoArchivoDescripcion.trim() || undefined // Enviar undefined si está vacío
    ).pipe(
      finalize(() => {
        loading.dismiss();
        this.isUploadingFile = false; // Desactivar estado de subida
      })
    ).subscribe({
      next: (response: UploadResponse) => {
        console.log('DEBUG: [CarpetaPage] Archivo subido, respuesta:', response); // DEBUG
        this.presentToast('Archivo subido exitosamente.', 'success');
        this.nuevoArchivoNombre = '';
        this.nuevoArchivoDescripcion = '';
        this.archivoParaSubir = null;
        // Limpiar el input de archivo (esto es un poco hacky, pero común)
        const fileInput = document.getElementById('fileUploadInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        this.cargarArchivos(false); // Recargar la lista de archivos
      },
      error: (error) => {
        console.error('DEBUG: [CarpetaPage] Error al subir archivo:', error); // DEBUG
        this.presentToast(`Error al subir el archivo: ${error.message || 'Error desconocido'}`, 'danger');
      }
    });
  }

  async descargarArchivo(archivo: ArchivoAdjuntoInfo) {
    // currentUserUid ya se obtiene en ngOnInit
    if (!this.currentUserUid) { // UID es necesario para la autorización en el servicio
      this.presentToast('Error de autenticación. No se puede descargar.', 'danger');
      return;
    }
    console.log(`DEBUG: [CarpetaPage] Intentando descargar archivoId: ${archivo.archivo_id}, Nombre: ${archivo.nombre_archivo}`); // DEBUG
    const loading = await this.mostrarLoading('Descargando archivo...');

    this.archivoAdjuntoService.downloadFile(archivo.archivo_id).pipe(
      finalize(() => loading.dismiss())
    ).subscribe({
      next: (blob) => {
        saveAs(blob, archivo.nombre_archivo); // Usar file-saver para iniciar la descarga
        console.log(`DEBUG: [CarpetaPage] Archivo ${archivo.nombre_archivo} preparado para descarga.`); // DEBUG
        this.presentToast('Archivo descargado.', 'success');
      },
      error: (err) => {
        console.error('DEBUG: [CarpetaPage] Error al descargar archivo:', err); // DEBUG
        this.presentToast(`Error al descargar el archivo: ${err.message || 'Error desconocido'}`, 'danger');
      }
    });
  }

  async presentArchivoActions(archivo: ArchivoAdjuntoInfo) {
    console.log(`DEBUG: [CarpetaPage] presentArchivoActions para archivoId: ${archivo.archivo_id}`); // DEBUG

    const alert = await this.alertCtrl.create({
      header: 'Gestionar Archivo',
      // subHeader: archivo.nombre_archivo, // Podrías usar esto si quieres
      inputs: [
        {
          name: 'nombre_archivo',
          type: 'text',
          value: archivo.nombre_archivo,
          placeholder: 'Nuevo nombre del archivo (*)',
          attributes: {
            required: true
          }
        },
        {
          name: 'descripcion',
          type: 'textarea',
          value: archivo.descripcion || '', // Mostrar vacío si es null/undefined
          placeholder: 'Nueva descripción (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('DEBUG: [CarpetaPage] Gestión de archivo cancelada.'); // DEBUG
          }
        },
        {
          text: 'Guardar Cambios',
          handler: async (data) => {
            const nuevoNombre = data.nombre_archivo ? data.nombre_archivo.trim() : '';
            const nuevaDescripcion = data.descripcion ? data.descripcion.trim() : null; // Enviar null si está vacío

            if (!nuevoNombre) {
              this.presentToast('El nombre del archivo no puede estar vacío.', 'warning');
              return false; // Evita que el alert se cierre
            }

            if (nuevoNombre === archivo.nombre_archivo && (nuevaDescripcion === archivo.descripcion || (!nuevaDescripcion && !archivo.descripcion))) {
              this.presentToast('No se realizaron cambios.', 'primary');
              return true;
            }

            console.log(`DEBUG: [CarpetaPage] Guardando cambios para archivoId: ${archivo.archivo_id}. Nuevo nombre: "${nuevoNombre}", Nueva descripción: "${nuevaDescripcion}"`); // DEBUG
            const loading = await this.mostrarLoading('Actualizando archivo...');
            this.archivoAdjuntoService.updateFileDetails(archivo.archivo_id, nuevoNombre, nuevaDescripcion ?? undefined).pipe(
              finalize(() => loading.dismiss())
            ).subscribe({
              next: () => {
                this.presentToast('Detalles del archivo actualizados.', 'success');
                this.cargarArchivos(false); // Recargar lista de archivos
              },
              error: (err) => {
                this.presentToast(`Error al actualizar el archivo: ${err.message || 'Error desconocido'}`, 'danger');
              }
            });
            return true;
          }
        },
        {
          text: 'Eliminar Archivo',
          role: 'destructive', // Para darle un estilo distintivo (rojo usualmente)
          cssClass: 'alert-button-destructive',
          handler: () => {
            // No es necesario hacer el console.log aquí porque se hará en confirmDeleteArchivo
            this.confirmDeleteArchivo(archivo);
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmDeleteArchivo(archivo: ArchivoAdjuntoInfo) {
    console.log(`DEBUG: [CarpetaPage] confirmDeleteArchivo para archivoId: ${archivo.archivo_id}`); // DEBUG
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar el archivo "${archivo.nombre_archivo}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'alert-button-destructive',
          handler: async () => {
            console.log(`DEBUG: [CarpetaPage] Eliminación confirmada para archivoId: ${archivo.archivo_id}`); // DEBUG
            const loading = await this.mostrarLoading('Eliminando archivo...');
            this.archivoAdjuntoService.deleteFile(archivo.archivo_id).pipe(
              finalize(() => loading.dismiss())
            ).subscribe({
              next: () => {
                this.presentToast('Archivo eliminado.', 'success');
                this.cargarArchivos(false); // Recargar lista de archivos
              },
              error: (err) => {
                this.presentToast(`Error al eliminar el archivo: ${err.message || 'Error desconocido'}`, 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
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


  async presentFolderActions() {
    console.log('DEBUG: [CarpetaPage] presentFolderActions called for folderId:', this.carpetaId);
    if (!this.canManageFolder) { // Agrega un guard para evitar mostrar acciones para la carpeta "General"
      console.log('DEBUG: [CarpetaPage] Las acciones de gestión están deshabilitadas para esta carpeta (probablemente "General").'); // DEBUG: Acciones deshabilitadas

      return;
    }
    if (!this.carpetaId) { // Esta comprobación es algo redundante si canManageFolder lo maneja, pero es segura.
      this.presentToast('No se puede gestionar la carpeta: el ID de la carpeta no está disponible.', 'danger');
      return;
    }

    const actionSheet = await this.actionSheetCtrl.create({
      header: `Acciones para: ${this.nombreCarpeta}`,
      buttons: [
        {
          text: 'Renombrar Carpeta',
          icon: 'create-outline',
          handler: () => {
            console.log('DEBUG: [CarpetaPage] Acción "Renombrar Carpeta" seleccionada.');
            this.promptRenameCurrentFolder();
          }
        },
        {
          text: 'Eliminar Carpeta',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => {
            console.log('DEBUG: [CarpetaPage] Acción "Eliminar Carpeta" seleccionada.');
            this.confirmDeleteCurrentFolder();
          }
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel',
          handler: () => {
            console.log('DEBUG: [CarpetaPage] Acciones de carpeta canceladas.');
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async promptRenameCurrentFolder() { // Método para solicitar al usuario el nuevo nombre de la carpeta
    console.log('DEBUG: [CarpetaPage] promptRenameCurrentFolder llamado.'); // DEBUG: Log del prompt
    if (!this.carpetaId) {
      console.error('DEBUG: [CarpetaPage] No se puede renombrar, carpetaId es nulo.');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Renombrar Carpeta',
      inputs: [
        {
          name: 'newName',
          type: 'text',
          value: this.nombreCarpeta, // Rellenar con el nombre actual de la carpeta
          placeholder: 'Ingresa el nuevo nombre de la carpeta'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            const newName = data.newName ? data.newName.trim() : '';
            if (!newName) {
              this.presentToast('El nombre de la carpeta no puede estar vacío.', 'warning');
              return false; // Evita que la alerta se cierre si falla la validación
            }
            if (newName === this.nombreCarpeta) {
              this.presentToast('El nuevo nombre es el mismo que el actual. No se realizaron cambios.', 'primary');
              return true; // Cierra la alerta, no se necesita acción
            }

            console.log(`DEBUG: [CarpetaPage] Intentando renombrar la carpetaId ${this.carpetaId} de "${this.nombreCarpeta}" a "${newName}"`); // DEBUG: Log del intento de renombrar
            const loading = await this.mostrarLoading('Renombrando carpeta...');
            this.carpetaService.renameFolder(this.carpetaId!, newName).pipe(
              finalize(() => loading.dismiss())
            ).subscribe({
              next: (response) => {
                console.log('DEBUG: [CarpetaPage] Respuesta exitosa de renameFolder:', response); // DEBUG: Log de éxito
                this.nombreCarpeta = newName; // Actualiza el nombre de la carpeta localmente
                this.cdr.detectChanges(); // Activa manualmente la detección de cambios para actualizar el título
                this.presentToast('Carpeta renombrada exitosamente.', 'success');
                // Si esta página es parte de un estado de aplicación más grande, considera emitir un evento
                // o usar un servicio compartido para notificar a otros componentes (por ejemplo, una lista de carpetas en otro lugar)
              },
              error: (error: HttpErrorResponse) => {
                console.error('DEBUG: [CarpetaPage] Error en renameFolder:', error); // DEBUG: Log del error
                let userMessage = 'No se pudo renombrar la carpeta. Por favor, inténtalo de nuevo.';
                let recommendation = '';

                if (error.error && typeof error.error === 'object') {
                  const errResponse = error.error as RenameFolderErrorResponse;
                  if (errResponse.error) {
                    userMessage = errResponse.error;
                  }
                  if (errResponse.recommendation) {
                    recommendation = errResponse.recommendation;
                  }
                } else if (error.message) { // Fallback para errores genéricos
                  userMessage = error.message;
                }

                // Mostrar el mensaje de error específico y la recomendación si están disponibles
                const fullMessage = recommendation ? `${userMessage} ${recommendation}` : userMessage;
                this.presentToast(fullMessage, 'danger', recommendation ? 6000 : 4000); // Duración más larga si hay una recomendación
              }
            });
            return true; // Permite que la alerta se cierre
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmDeleteCurrentFolder() { // Método para confirmar la eliminación de la carpeta
    console.log('DEBUG: [CarpetaPage] confirmDeleteCurrentFolder llamado.'); // DEBUG: Log de confirmación
    if (!this.carpetaId) {
      console.error('DEBUG: [CarpetaPage] No se puede eliminar, carpetaId es nulo.');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      // Mensaje de advertencia específico solicitado por el usuario
      message: `¿Estás seguro de que deseas eliminar la carpeta "${this.nombreCarpeta}"? Todo su contenido (notas, etc.) se eliminará permanentemente y no se podrá recuperar.`,
      cssClass: 'custom-alert-destructive', // Opcional: para estilos personalizados de alertas destructivas
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel' },
        {
          text: 'Eliminar',
          role: 'destructive', // Rol estándar de Ionic para acciones destructivas
          cssClass: 'alert-button-destructive', // Clase personalizada para estilos
          handler: async () => {
            console.log(`DEBUG: [CarpetaPage] Eliminación confirmada para carpetaId ${this.carpetaId}`); // DEBUG: Log de eliminación confirmada
            const loading = await this.mostrarLoading('Eliminando carpeta y su contenido...');
            this.carpetaService.deleteFolder(this.carpetaId!).pipe(
              finalize(() => loading.dismiss())
            ).subscribe({
              next: (response) => {
                console.log('DEBUG: [CarpetaPage] Respuesta exitosa de deleteFolder:', response); // DEBUG: Log de éxito
                this.presentToast('Carpeta y su contenido eliminados exitosamente.', 'success');
                // Después de la eliminación, navega al usuario lejos de esta página, por ejemplo, a la lista principal de carpetas o al panel de control
                this.router.navigate(['/chat'], { replaceUrl: true }); // replaceUrl para evitar volver a la página de la carpeta eliminada
              },
              error: (error: HttpErrorResponse) => {
                console.error('DEBUG: [CarpetaPage] Error en deleteFolder:', error); // DEBUG: Log del error
                const errorMessage = (error.error && error.error.error) ? error.error.error : 'No se pudo eliminar la carpeta. Por favor, inténtalo de nuevo.';
                this.presentToast(errorMessage, 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }


  async promptMoveNota(nota: Nota) { // Método para solicitar al usuario que seleccione una nueva carpeta para la nota
    console.log(`DEBUG: [CarpetaPage] promptMoveNota llamado para notaId: ${nota.nota_id}`); // DEBUG: Log de la llamada

    if (!this.currentUserUid) {
      this.presentToast('Error de autenticación. No se puede mover la nota.', 'danger');
      return;
    }

    const loading = await this.mostrarLoading('Cargando carpetas...');
    this.carpetaService.listPersonalFolders().pipe(
      finalize(() => loading.dismiss())
    ).subscribe({
      next: async (todasLasCarpetas) => {
        // Filtra la carpeta actual y la carpeta "General" si no queremos mover notas *a* "General" explícitamente de esta manera
        // Por ahora, permitimos mover a cualquier otra carpeta, incluida "General" si no es la actual.
        const carpetasDisponibles = todasLasCarpetas.filter(c => c.carpeta_id !== this.carpetaId);

        if (carpetasDisponibles.length === 0) {
          this.presentToast('No hay otras carpetas disponibles para mover esta nota.', 'primary');
          return;
        }

        console.log('DEBUG: [CarpetaPage] Carpetas disponibles para mover la nota:', carpetasDisponibles); // DEBUG: Log de carpetas disponibles

        const alertInputs = carpetasDisponibles.map(carpeta => ({
          type: 'radio' as 'radio', // Tipo explícito 'radio'
          label: carpeta.nombre,
          value: carpeta.carpeta_id.toString(), // El valor debe ser una cadena para el controlador de alertas de radio
          // checked: false // Opcional: preseleccionar uno
        }));

        const alert = await this.alertCtrl.create({
          header: 'Mover Nota A...',
          inputs: alertInputs,
          buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Mover',
              handler: async (selectedFolderIdStr) => {
                if (!selectedFolderIdStr) {
                  this.presentToast('No se seleccionó ninguna carpeta.', 'warning');
                  return; // O return false si el handler espera un booleano
                }
                const selectedFolderId = parseInt(selectedFolderIdStr, 10);
                console.log(`DEBUG: [CarpetaPage] Intentando mover la nota ${nota.nota_id} a la carpeta ${selectedFolderId}`); // DEBUG: Log del intento de mover

                const moveLoading = await this.mostrarLoading('Moviendo nota...');
                this.notaService.moveNoteToFolder(nota.nota_id, selectedFolderId).pipe(
                  finalize(() => moveLoading.dismiss())
                ).subscribe({
                  next: (response) => {
                    console.log('DEBUG: [CarpetaPage] Respuesta exitosa de moveNoteToFolder:', response); // DEBUG: Log de éxito
                    this.presentToast(`Nota movida exitosamente a la carpeta seleccionada.`, 'success');
                    // Eliminar la nota de la vista actual y actualizar
                    this.notas = this.notas.filter(n => n.nota_id !== nota.nota_id);
                    this.cdr.detectChanges(); // Actualizar la vista
                    // Opcional: Si quieres recargar todas las notas de la carpeta actual:
                    // this.cargarNotas(false);
                  },
                  error: (error: HttpErrorResponse) => {
                    console.error('DEBUG: [CarpetaPage] Error en moveNoteToFolder:', error); // DEBUG: Log del error
                    const errorMessage = (error.error && error.error.error) ? error.error.error : 'Failed to move note. Please try again.';
                    this.presentToast(errorMessage, 'danger');
                  }
                });
              }
            }
          ]
        });
        await alert.present();
        },
        error: (error) => {
            console.error('DEBUG: [CarpetaPage] Error loading folders for move operation:', error); // DEBUG: Log folder list error
            this.presentToast('Could not load folder list to move note.', 'danger');
        }
    });
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