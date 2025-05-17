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
  private currentUserUid: string | null = null;

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
    if (!this.carpetaId) {
      console.warn('[CarpetaPage] cargarDatosIniciales - No folderId available.'); // DEBUG: Warning
      return;
    }
    this.isLoading = true; 
    console.log('[CarpetaPage] Cargando datos iniciales...'); // DEBUG: Loading data

    this.carpetaService.listPersonalFolders().subscribe(
      todasLasCarpetas => {
        const carpetaActual = todasLasCarpetas.find(c => c.carpeta_id === this.carpetaId);
        this.nombreCarpeta = carpetaActual ? carpetaActual.nombre : 'Carpeta no encontrada';
        console.log(`DEBUG: [CarpetaPage] cargarDatosIniciales - Folder name: "${this.nombreCarpeta}"`); // DEBUG: Folder name
        // Determine if the current folder is the "General" folder (case-insensitive check)
        // And set canManageFolder accordingly.
        if (carpetaActual) {
            this.canManageFolder = carpetaActual.nombre.toLowerCase() !== 'general';
            console.log(`DEBUG: [CarpetaPage] cargarDatosIniciales - canManageFolder set to: ${this.canManageFolder} (isGeneralFolder: ${!this.canManageFolder})`); // DEBUG: Management status
        } else {
            this.canManageFolder = false; // If folder not found, cannot manage it.
            this.presentToast('The requested folder does not exist or you do not have access.', 'warning');
            // Consider navigating back if the folder is truly gone, e.g., this.goBack();
        }
        if (!carpetaActual) { // This part might be redundant if handled above, but kept for safety.
            // this.presentToast('La carpeta solicitada no existe o no tienes acceso.', 'warning');
        }
        this.cdr.detectChanges(); // Ensure UI updates
      },
      error => {
        console.error('[CarpetaPage] Error al cargar lista de carpetas para obtener nombre:', error); // DEBUG: Error
        this.nombreCarpeta = 'Error al cargar nombre';
        this.canManageFolder = false; // Cannot manage if there's an error loading name
        this.cdr.detectChanges(); // Ensure UI updates
      }
    );
    this.cargarNotas(false); 
    this.cargarArchivos(false); 
  }

  async cargarNotas(mostrarSpinnerGlobal: boolean = true) {
    if (!this.carpetaId) {
      console.warn('[CarpetaPage] cargarNotas llamado sin carpetaId.');
      if(mostrarSpinnerGlobal) this.isLoading = false; 
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
      if(mostrarSpinnerGlobal) this.isLoadingArchivos = false;
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
    if (!this.canManageFolder) { // Add guard to prevent showing actions for "General" folder
        console.log('DEBUG: [CarpetaPage] Management actions are disabled for this folder (likely "General").'); // DEBUG: Actions disabled
  
        return;
    }
    if (!this.carpetaId) { // This check is somewhat redundant if canManageFolder handles it, but safe.
        this.presentToast('Cannot manage folder: Folder ID is not available.', 'danger');
        return;
    }

    const actionSheet = await this.actionSheetCtrl.create({
      header: `Actions for: ${this.nombreCarpeta}`, 
      buttons: [
        {
          text: 'Rename Folder',
          icon: 'create-outline', 
          handler: () => {
            console.log('DEBUG: [CarpetaPage] "Rename Folder" action selected.'); 
            this.promptRenameCurrentFolder();
          }
        },
        {
          text: 'Delete Folder',
          role: 'destructive', 
          icon: 'trash-outline', 
          handler: () => {
            console.log('DEBUG: [CarpetaPage] "Delete Folder" action selected.'); 
            this.confirmDeleteCurrentFolder();
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline', 
          role: 'cancel',
          handler: () => {
            console.log('DEBUG: [CarpetaPage] Folder actions cancelled.'); 
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async promptRenameCurrentFolder() { // Method to prompt user for new folder name
    console.log('DEBUG: [CarpetaPage] promptRenameCurrentFolder called.'); // DEBUG: Log prompt
    if (!this.carpetaId) {
        console.error('DEBUG: [CarpetaPage] Cannot rename, folderId is null.');
        return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Rename Folder',
      inputs: [
        {
          name: 'newName',
          type: 'text',
          value: this.nombreCarpeta, // Pre-fill with the current folder name
          placeholder: 'Enter new folder name'
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: async (data) => {
            const newName = data.newName ? data.newName.trim() : '';
            if (!newName) {
              this.presentToast('Folder name cannot be empty.', 'warning');
              return false; // Prevent alert from closing if validation fails
            }
            if (newName === this.nombreCarpeta) {
              this.presentToast('The new name is the same as the current one. No changes made.', 'primary');
              return true; // Close alert, no action needed
            }

            console.log(`DEBUG: [CarpetaPage] Attempting to rename folderId ${this.carpetaId} from "${this.nombreCarpeta}" to "${newName}"`); // DEBUG: Log rename attempt
            const loading = await this.mostrarLoading('Renaming folder...');
            this.carpetaService.renameFolder(this.carpetaId!, newName).pipe(
              finalize(() => loading.dismiss())
            ).subscribe({
              next: (response) => {
                console.log('DEBUG: [CarpetaPage] renameFolder successful response:', response); // DEBUG: Log success
                this.nombreCarpeta = newName; // Update the local folder name
                this.cdr.detectChanges(); // Manually trigger change detection to update title
                this.presentToast('Folder renamed successfully.', 'success');
                // If this page is part of a larger app state, consider emitting an event
                // or using a shared service to notify other components (e.g., a folder list elsewhere)
              },
              error: (error: HttpErrorResponse) => {
                console.error('DEBUG: [CarpetaPage] renameFolder error:', error); // DEBUG: Log error
                let userMessage = 'Failed to rename folder. Please try again.';
                let recommendation = '';

                if (error.error && typeof error.error === 'object') {
                  const errResponse = error.error as RenameFolderErrorResponse;
                  if (errResponse.error) {
                    userMessage = errResponse.error;
                  }
                  if (errResponse.recommendation) {
                    recommendation = errResponse.recommendation;
                  }
                } else if (error.message) { // Fallback for generic errors
                  userMessage = error.message;
                }
                
                // Display the specific error message and recommendation if available
                const fullMessage = recommendation ? `${userMessage} ${recommendation}` : userMessage;
                this.presentToast(fullMessage, 'danger', recommendation ? 6000 : 4000); // Longer duration if there's a recommendation
              }
            });
            return true; // Allow alert to close
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmDeleteCurrentFolder() { // Method to confirm folder deletion
    console.log('DEBUG: [CarpetaPage] confirmDeleteCurrentFolder called.'); // DEBUG: Log confirmation
    if (!this.carpetaId) {
        console.error('DEBUG: [CarpetaPage] Cannot delete, folderId is null.');
        return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirm Deletion',
      // User requested specific warning message
      message: `Are you sure you want to delete the folder "${this.nombreCarpeta}"? All its content (notes, etc.) will be permanently deleted and cannot be recovered.`,
      cssClass: 'custom-alert-destructive', // Optional: for custom styling of destructive alerts
      buttons: [
        { text: 'Cancel', role: 'cancel', cssClass: 'alert-button-cancel' },
        {
          text: 'Delete',
          role: 'destructive', // Standard Ionic role for destructive actions
          cssClass: 'alert-button-destructive', // Custom class for styling
          handler: async () => {
            console.log(`DEBUG: [CarpetaPage] Deletion confirmed for folderId ${this.carpetaId}`); // DEBUG: Log deletion confirmed
            const loading = await this.mostrarLoading('Deleting folder and its contents...');
            this.carpetaService.deleteFolder(this.carpetaId!).pipe(
              finalize(() => loading.dismiss())
            ).subscribe({
              next: (response) => {
                console.log('DEBUG: [CarpetaPage] deleteFolder successful response:', response); // DEBUG: Log success
                this.presentToast('Folder and its contents deleted successfully.', 'success');
                // After deletion, navigate the user away from this page, e.g., to the main folder list or dashboard
                this.router.navigate(['/chat'], { replaceUrl: true }); // replaceUrl to prevent going back to the deleted folder page
              },
              error: (error: HttpErrorResponse) => {
                console.error('DEBUG: [CarpetaPage] deleteFolder error:', error); // DEBUG: Log error
                const errorMessage = (error.error && error.error.error) ? error.error.error : 'Failed to delete folder. Please try again.';
                this.presentToast(errorMessage, 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }


   async promptMoveNota(nota: Nota) { // Method to prompt user to select a new folder for the note
    console.log(`DEBUG: [CarpetaPage] promptMoveNota called for noteId: ${nota.nota_id}`); // DEBUG: Log call

    if (!this.currentUserUid) {
        this.presentToast('Authentication error. Cannot move note.', 'danger');
        return;
    }

    const loading = await this.mostrarLoading('Loading folders...');
    this.carpetaService.listPersonalFolders().pipe(
        finalize(() => loading.dismiss())
    ).subscribe({
        next: async (todasLasCarpetas) => {
            // Filter out the current folder and the "General" folder if we don't want to move notes *to* "General" explicitly this way
            // For now, we allow moving to any other folder, including "General" if it's not the current one.
            const carpetasDisponibles = todasLasCarpetas.filter(c => c.carpeta_id !== this.carpetaId);

            if (carpetasDisponibles.length === 0) {
                this.presentToast('No other folders available to move this note to.', 'primary');
                return;
            }

            console.log('DEBUG: [CarpetaPage] Available folders for moving note:', carpetasDisponibles); // DEBUG: Log available folders

            const alertInputs = carpetasDisponibles.map(carpeta => ({
                type: 'radio' as 'radio', // Explicitly type 'radio'
                label: carpeta.nombre,
                value: carpeta.carpeta_id.toString(), // Value must be a string for alert controller radio
                // checked: false // Optional: pre-select one
            }));

            const alert = await this.alertCtrl.create({
                header: 'Move Note To...',
                inputs: alertInputs,
                buttons: [
                    { text: 'Cancel', role: 'cancel' },
                    {
                        text: 'Move',
                        handler: async (selectedFolderIdStr) => {
                            if (!selectedFolderIdStr) {
                                this.presentToast('No folder selected.', 'warning');
                                return; // Or return false if inside handler expects boolean
                            }
                            const selectedFolderId = parseInt(selectedFolderIdStr, 10);
                            console.log(`DEBUG: [CarpetaPage] Attempting to move note ${nota.nota_id} to folder ${selectedFolderId}`); // DEBUG: Log move attempt

                            const moveLoading = await this.mostrarLoading('Moving note...');
                            this.notaService.moveNoteToFolder(nota.nota_id, selectedFolderId).pipe(
                                finalize(() => moveLoading.dismiss())
                            ).subscribe({
                                next: (response) => {
                                    console.log('DEBUG: [CarpetaPage] moveNoteToFolder successful response:', response); // DEBUG: Log success
                                    this.presentToast(`Note moved successfully to selected folder.`, 'success');
                                    // Remove the note from the current view and refresh
                                    this.notas = this.notas.filter(n => n.nota_id !== nota.nota_id);
                                    this.cdr.detectChanges(); // Update the view
                                    // Optional: If you want to reload all notes for the current folder:
                                    // this.cargarNotas(false); 
                                },
                                error: (error: HttpErrorResponse) => {
                                    console.error('DEBUG: [CarpetaPage] moveNoteToFolder error:', error); // DEBUG: Log error
                                    const errorMessage = (error.error && error.error.error) ? error.error.error : 'Failed to move note.';
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