// src/app/services/carpeta.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators'; 
import { AuthService } from './auth.service'; // Necesario para obtener el UID del usuario


export interface Carpeta { // Definir una interfaz para tus carpetas
  carpeta_id: number; // o string, según tu BD
  nombre: string;
  // user_id?: string; // Opcional
  // espacio_id?: number; // Opcional
}

// Added for typing the error response when renaming a folder
export interface RenameFolderErrorResponse {
  renamed: boolean;
  error: string;
  recommendation?: string;
}


@Injectable({
  providedIn: 'root'
})
export class CarpetaService {
  // URL directa a tu endpoint de Django para carpetas
  private apiUrl = 'http://127.0.0.1:8000/api/folders/'; 

  constructor(private http: HttpClient, private authService: AuthService) {
    console.log('[CarpetaService] Constructor: Servicio de carpetas instanciado. API URL:', this.apiUrl);
  }

  createPersonalFolder(nombreCarpeta: string): Observable<any> {
    console.log('[CarpetaService] Iniciando createPersonalFolder con nombre:', nombreCarpeta);
    const user = this.authService.getCurrentUser(); // Obtiene el usuario actual de Firebase

    if (!user || !user.uid) {
      const errorMsg = 'Usuario no autenticado. No se puede crear carpeta.';
      console.error('[CarpetaService] Error:', errorMsg);
      return throwError(() => new Error(errorMsg));
    }
    console.log('[CarpetaService] Usuario obtenido para crear carpeta. UID:', user.uid);

    const payload = {
      uid: user.uid,
      nombre: nombreCarpeta
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
       
      })
    };

    console.log('[CarpetaService] Enviando POST a:', this.apiUrl, 'con payload:', payload);

    return this.http.post<any>(this.apiUrl, payload, httpOptions)
      .pipe(
        tap(response => {
          console.log('[CarpetaService] Respuesta exitosa de POST:', response);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('[CarpetaService] Error en la solicitud POST. Status:', error.status, 'Error Body:', error.error);
          // Propagar el HttpErrorResponse completo para que el componente pueda manejarlo
          return throwError(() => error);
        })
      );
  }

  listPersonalFolders(): Observable<Carpeta[]> {
    console.log('[CarpetaService] Iniciando listPersonalFolders.');
    const user = this.authService.getCurrentUser();

    if (!user || !user.uid) {
      const errorMsg = 'Usuario no autenticado. No se pueden listar carpetas.';
      console.error('[CarpetaService] Error:', errorMsg);
      return throwError(() => new Error(errorMsg));
    }
    console.log('[CarpetaService] Usuario para listar carpetas. UID:', user.uid);

    // Construir los parámetros de la query para la petición GET
    const params = new HttpParams().set('uid', user.uid);
    const httpOptions = { params: params };

    console.log('[CarpetaService] Enviando GET a:', this.apiUrl, 'con params:', params.toString());
    return this.http.get<{ folders: Carpeta[] }>(this.apiUrl, httpOptions) // Esperamos un objeto { folders: [...] }
      .pipe(
        map(response => response.folders), // Extraer solo el array de carpetas
        tap(carpetas => console.log('[CarpetaService] Respuesta GET (listar). Carpetas:', carpetas)),
        catchError((error: HttpErrorResponse) => {
          console.error('[CarpetaService] Error en GET (listar). Status:', error.status, 'Body:', error.error);
          return throwError(() => error);
        })
      );
  }
  renameFolder(folderId: number, newName: string): Observable<any> { // Method to rename a folder
    console.log(`DEBUG: [CarpetaService] Attempting to rename folder. FolderID: ${folderId}, NewName: "${newName}"`); // DEBUG: Log call
    const user = this.authService.getCurrentUser();
    if (!user || !user.uid) {
      const errorMsg = 'User not authenticated. Cannot rename folder.';
      console.error('[CarpetaService] Error:', errorMsg);
      return throwError(() => new Error(errorMsg));
    }

    const payload = { // Payload for the PUT request
      uid: user.uid,
      nombre: newName
    };
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    
    const requestUrl = `${this.apiUrl}${folderId}/`; // URL for specific folder: e.g., /api/folders/123/
    console.log(`DEBUG: [CarpetaService] Sending PUT to: ${requestUrl} with payload:`, payload); // DEBUG: Log HTTP call details

    return this.http.put<any>(requestUrl, payload, httpOptions)
      .pipe(
        tap(response => {
          console.log(`DEBUG: [CarpetaService] renameFolder successful response:`, response); // DEBUG: Log success response
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(`DEBUG: [CarpetaService] renameFolder error. Status: ${error.status}, Body:`, error.error); // DEBUG: Log error response
          // Propagate the full HttpErrorResponse so the component can access error.error for specific messages
          return throwError(() => error); 
        })
      );
  }

  deleteFolder(folderId: number): Observable<any> { // Method to delete a folder
    console.log(`DEBUG: [CarpetaService] Attempting to delete folder. FolderID: ${folderId}`); // DEBUG: Log call
    const user = this.authService.getCurrentUser();
    if (!user || !user.uid) {
      const errorMsg = 'User not authenticated. Cannot delete folder.';
      console.error('[CarpetaService] Error:', errorMsg);
      return throwError(() => new Error(errorMsg));
    }

    // UID is sent as a query parameter for backend verification
    const params = new HttpParams().set('uid', user.uid);
    const httpOptions = { params: params };

    const requestUrl = `${this.apiUrl}${folderId}/`; // URL for specific folder: e.g., /api/folders/123/
    console.log(`DEBUG: [CarpetaService] Sending DELETE to: ${requestUrl} with params:`, params.toString()); // DEBUG: Log HTTP call details

    return this.http.delete<any>(requestUrl, httpOptions)
      .pipe(
        tap(response => {
          console.log(`DEBUG: [CarpetaService] deleteFolder successful response:`, response); // DEBUG: Log success response
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(`DEBUG: [CarpetaService] deleteFolder error. Status: ${error.status}, Body:`, error.error); // DEBUG: Log error response
          return throwError(() => error);
        })
      );
  }
// ======== End Modification ========
}




  

