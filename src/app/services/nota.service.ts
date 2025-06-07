// src/app/services/nota.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs'; 
import { catchError, map, tap, switchMap } from 'rxjs/operators'; 
import { AuthService } from './auth.service';

export interface Nota {
  nota_id: number;
  contenido: string;
  created_at?: string;
  updated_at?: string;
}


export interface NotaCreadaResponse {
  created: boolean;
  message: string;
  nota?: Nota;
}

@Injectable({
  providedIn: 'root'
})
export class NotaService {
  private apiUrl = 'http://127.0.0.1:8000/api/notes/';

  constructor(private http: HttpClient, private authService: AuthService) {
    console.log('[NotaService] Constructor. API URL:', this.apiUrl);
  }

  getNotesForFolder(carpetaId: number): Observable<Nota[]> {
    console.log(`[NotaService] Solicitando notas para carpetaId: ${carpetaId}`);

    // Convertimos la promesa a un Observable y usamos switchMap
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          const errorMsg = 'Usuario no autenticado. No se pueden listar notas.';
          console.error('[NotaService] Error:', errorMsg);
          return throwError(() => new Error(errorMsg));
        }
        console.log(`[NotaService] Usuario para listar notas. UID: ${user.uid}`);

        const params = new HttpParams()
          .set('carpeta_id', carpetaId.toString())
          .set('uid', user.uid); // Ahora 'user.uid' es seguro de usar

        const httpOptions = { params: params };

        console.log('[NotaService] Enviando GET a:', this.apiUrl, 'con params:', params.toString());
        return this.http.get<{ notes: Nota[] }>(this.apiUrl, httpOptions)
          .pipe(
            map(response => response.notes || []),
            tap(notas => console.log(`[NotaService] Notas recibidas para carpeta ${carpetaId}:`, notas)),
            catchError(this.handleError) // Usar el manejador de errores común
          );
      })
    );
  }

  crearNota(carpetaId: number, contenido: string): Observable<NotaCreadaResponse> {
    console.log(`[NotaService] Creando nota en carpetaId: ${carpetaId}, contenido: "${contenido}"`);

    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          return throwError(() => new Error('Usuario no autenticado para crear nota.'));
        }

        const payload = {
          uid: user.uid, // Acceso seguro al uid
          carpeta_id: carpetaId.toString(),
          contenido: contenido
        };
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

        return this.http.post<NotaCreadaResponse>(this.apiUrl, payload, httpOptions)
          .pipe(
            tap(response => console.log('[NotaService] Respuesta crearNota:', response)),
            catchError(this.handleError)
          );
      })
    );
  }

  actualizarNota(notaId: number, nuevoContenido: string): Observable<any> {
    console.log(`[NotaService] Actualizando notaId: ${notaId}, nuevo contenido: "${nuevoContenido}"`);

    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          return throwError(() => new Error('Usuario no autenticado para actualizar nota.'));
        }

        const payload = {
          uid: user.uid, // Acceso seguro al uid
          contenido: nuevoContenido
        };
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        const url = `${this.apiUrl}${notaId}/`;

        return this.http.put<any>(url, payload, httpOptions)
          .pipe(
            tap(response => console.log('[NotaService] Respuesta actualizarNota:', response)),
            catchError(this.handleError)
          );
      })
    );
  }

  eliminarNota(notaId: number): Observable<any> {
    console.log(`[NotaService] Eliminando notaId: ${notaId}`);

    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          return throwError(() => new Error('Usuario no autenticado para eliminar nota.'));
        }

        const params = new HttpParams().set('uid', user.uid); 
        const httpOptions = { params: params };
        const url = `${this.apiUrl}${notaId}/`;

        return this.http.delete<any>(url, httpOptions)
          .pipe(
            tap(response => console.log('[NotaService] Respuesta eliminarNota:', response)),
            catchError(this.handleError)
          );
      })
    );
  }


  moveNoteToFolder(notaId: number, newFolderId: number): Observable<any> { 
    console.log(`DEBUG: [NotaService] Attempting to move note. NoteID: ${notaId}, NewFolderID: ${newFolderId}`);

    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          const errorMsg = 'User not authenticated. Cannot move note.';
          console.error('DEBUG: [NotaService] Error:', errorMsg);
          return throwError(() => new Error(errorMsg));
        }

        const payload = {
          uid: user.uid,
          new_folder_id: newFolderId 
        };
        const httpOptions = {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        };

        const requestUrl = `${this.apiUrl}${notaId}/`; // URL for specific note: e.g., /api/notes/456/
        console.log(`DEBUG: [NotaService] Sending PATCH to: ${requestUrl} with payload:`, payload); // DEBUG: Log HTTP call details

        return this.http.patch<any>(requestUrl, payload, httpOptions) // Using PATCH method
          .pipe(
            tap(response => {
              console.log(`DEBUG: [NotaService] moveNoteToFolder successful response:`, response); // DEBUG: Log success response
            }),
            catchError((error: HttpErrorResponse) => {
              console.error(`DEBUG: [NotaService] moveNoteToFolder error. Status: ${error.status}, Body:`, error.error); // DEBUG: Log error response
              // Propagate the full HttpErrorResponse so the component can access error.error for specific messages
              return throwError(() => error);
            })
          );
      })
    );
  }


  private handleError(error: HttpErrorResponse) {
    console.error('[NotaService] Ocurrió un error HTTP:', error.message, 'Status:', error.status, 'Body:', error.error);
    let errorMessage = 'Algo salió mal; por favor, inténtalo de nuevo más tarde.';
    if (error.error && error.error.error) { // Si Django devuelve un JSON con una clave "error"
      errorMessage = error.error.error;
    } else if (typeof error.error === 'string' && error.error.length < 200) { // Si el error es un string corto
      errorMessage = error.error;
    }
    return throwError(() => new Error(errorMessage));
  }
}