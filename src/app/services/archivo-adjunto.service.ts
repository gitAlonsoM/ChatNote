//src\app\services\archivo-adjunto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs'; // Importa 'from'
import { catchError, map, tap, switchMap } from 'rxjs/operators'; // Importa 'switchMap'
import { AuthService } from './auth.service';

// Interfaz para la información de un archivo adjunto (para listado)
export interface ArchivoAdjuntoInfo {
  archivo_id: number;
  nombre_archivo: string;
  descripcion?: string;
  nombre_mime: string;
  fecha_subida: string; // ISO String
}

// Interfaz para la respuesta de subida de archivo
export interface UploadResponse {
  attached: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArchivoAdjuntoService {
  private apiUrlBase = 'http://127.0.0.1:8000/api'; // URL base de tu API

  constructor(private http: HttpClient, private authService: AuthService) {
    console.log('[ArchivoAdjuntoService] Constructor. API URL Base:', this.apiUrlBase);
  }

  // Método para subir un archivo a una carpeta
  uploadFile(carpetaId: number, file: File, nombreArchivo: string, descripcion?: string): Observable<UploadResponse> {
    console.log(`DEBUG: [ArchivoAdjuntoService] Iniciando subida de archivo a carpetaId: ${carpetaId}`); // DEBUG: Inicio de subida

    // Convertimos la promesa a un Observable y usamos switchMap
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        const uid = user?.uid; // Acceso seguro al uid una vez que la promesa se resuelve
        if (!uid) {
          return throwError(() => new Error('Usuario no autenticado. No se puede subir el archivo.'));
        }

        const formData = new FormData();
        formData.append('file_content', file, file.name); // 'file_content' debe coincidir con el esperado en Django request.FILES
        formData.append('nombre_archivo', nombreArchivo);
        if (descripcion) {
          formData.append('descripcion', descripcion);
        }
        formData.append('uid', uid); // UID para la autorización en el backend

        // No se necesita HttpHeaders con 'Content-Type': 'multipart/form-data' explícitamente,
        // HttpClient lo maneja automáticamente cuando el body es FormData.

        const url = `${this.apiUrlBase}/folders/${carpetaId}/attachments/`;
        console.log(`DEBUG: [ArchivoAdjuntoService] Enviando POST a: ${url} con FormData.`); // DEBUG: Detalles de la llamada

        return this.http.post<UploadResponse>(url, formData)
          .pipe(
            tap(response => console.log('DEBUG: [ArchivoAdjuntoService] Respuesta de subida de archivo:', response)), // DEBUG: Respuesta de subida
            catchError(this.handleError)
          );
      })
    );
  }

  // Método para obtener la lista de archivos de una carpeta
  getFilesForFolder(carpetaId: number): Observable<ArchivoAdjuntoInfo[]> {
    console.log(`DEBUG: [ArchivoAdjuntoService] Solicitando archivos para carpetaId: ${carpetaId}`); // DEBUG: Solicitando archivos

    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        const uid = user?.uid; // Acceso seguro al uid
        if (!uid) {
          return throwError(() => new Error('Usuario no autenticado. No se pueden listar archivos.'));
        }

        const params = new HttpParams().set('uid', uid);
        const url = `${this.apiUrlBase}/folders/${carpetaId}/attachments/`;
        console.log(`DEBUG: [ArchivoAdjuntoService] Enviando GET a: ${url} con params: ${params.toString()}`); // DEBUG: Detalles de la llamada

        return this.http.get<{ attachments: ArchivoAdjuntoInfo[] }>(url, { params })
          .pipe(
            map(response => response.attachments || []),
            tap(archivos => console.log(`DEBUG: [ArchivoAdjuntoService] Archivos recibidos para carpeta ${carpetaId}:`, archivos)), // DEBUG: Archivos recibidos
            catchError(this.handleError)
          );
      })
    );
  }

  // Método para descargar un archivo
  downloadFile(archivoId: number): Observable<Blob> {
    console.log(`DEBUG: [ArchivoAdjuntoService] Solicitando descarga para archivoId: ${archivoId}`); // DEBUG: Solicitando descarga

    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        const uid = user?.uid; // Acceso seguro al uid
        if (!uid) {
          return throwError(() => new Error('Usuario no autenticado. No se puede descargar el archivo.'));
        }

        const params = new HttpParams().set('uid', uid);
        const url = `${this.apiUrlBase}/attachments/${archivoId}/`;
        console.log(`DEBUG: [ArchivoAdjuntoService] Enviando GET a: ${url} para descarga, con params: ${params.toString()}`); // DEBUG: Detalles de la llamada actualizada

        return this.http.get(url, { params, responseType: 'blob' }) // responseType: 'blob' es crucial
          .pipe(
            tap(() => console.log(`DEBUG: [ArchivoAdjuntoService] Blob del archivo ${archivoId} recibido.`)), // DEBUG: Blob recibido
            catchError(this.handleError)
          );
      })
    );
  }


  updateFileDetails(archivoId: number, nombreArchivo: string, descripcion?: string): Observable<any> {
    console.log(`DEBUG: [ArchivoAdjuntoService] Actualizando detalles para archivoId: ${archivoId}`); // DEBUG

    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        const uid = user?.uid; // Acceso seguro al uid
        if (!uid) {
          return throwError(() => new Error('Usuario no autenticado. No se pueden actualizar los detalles del archivo.'));
        }

        const payload = {
          uid: uid, // El UID se envía en el cuerpo para PUT según la vista de Django
          nombre_archivo: nombreArchivo,
          descripcion: descripcion === undefined || descripcion === null ? null : descripcion // Enviar null si está vacío o no definido
        };
        // HttpClient por defecto usa application/json para PUT con objetos
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

        const url = `${this.apiUrlBase}/attachments/${archivoId}/`;
        console.log(`DEBUG: [ArchivoAdjuntoService] Enviando PUT a: ${url} con payload:`, payload); // DEBUG

        return this.http.put<any>(url, payload, httpOptions)
          .pipe(
            tap(response => console.log('DEBUG: [ArchivoAdjuntoService] Respuesta de actualizar detalles:', response)), // DEBUG
            catchError(this.handleError)
          );
      })
    );
  }

  // Método para eliminar un archivo
  deleteFile(archivoId: number): Observable<any> {
    console.log(`DEBUG: [ArchivoAdjuntoService] Solicitando eliminación para archivoId: ${archivoId}`); // DEBUG

    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        const uid = user?.uid; // Acceso seguro al uid
        if (!uid) {
          return throwError(() => new Error('Usuario no autenticado. No se puede eliminar el archivo.'));
        }

        const params = new HttpParams().set('uid', uid); // UID como query param para DELETE
        const url = `${this.apiUrlBase}/attachments/${archivoId}/`;
        console.log(`DEBUG: [ArchivoAdjuntoService] Enviando DELETE a: ${url} con params: ${params.toString()}`); // DEBUG: Detalles de la llamada actualizada

        return this.http.delete<any>(url, { params })
          .pipe(
            tap(response => console.log('DEBUG: [ArchivoAdjuntoService] Respuesta de eliminar archivo:', response)), // DEBUG
            catchError(this.handleError)
          );
      })
    );
  }


  private handleError(error: HttpErrorResponse) {
    console.error('[ArchivoAdjuntoService] Ocurrió un error HTTP:', error.message, 'Status:', error.status, 'Body:', error.error); // Log del error
    let errorMessage = 'Algo salió mal con la operación de archivos; por favor, inténtalo de nuevo más tarde.';
    if (error.error && typeof error.error === 'object' && error.error.error) {
      errorMessage = error.error.error;
    } else if (typeof error.error === 'string' && error.error.length < 200) {
      errorMessage = error.error;
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    }
    return throwError(() => new Error(errorMessage));
  }
}