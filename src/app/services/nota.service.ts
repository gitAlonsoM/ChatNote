// src/app/services/nota.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http'; // <--- HttpHeaders AÑADIDO
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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
  private apiUrl = 'http://127.0.0.1:8000/api/notes/'; // Endpoint para notas

  constructor(private http: HttpClient, private authService: AuthService) {
    console.log('[NotaService] Constructor. API URL:', this.apiUrl);
  }

  getNotesForFolder(carpetaId: number): Observable<Nota[]> {
    console.log(`[NotaService] Solicitando notas para carpetaId: ${carpetaId}`);
    const user = this.authService.getCurrentUser();

    if (!user || !user.uid) {
      const errorMsg = 'Usuario no autenticado. No se pueden listar notas.';
      console.error('[NotaService] Error:', errorMsg);
      return throwError(() => new Error(errorMsg));
    }
    console.log(`[NotaService] Usuario para listar notas. UID: ${user.uid}`);

    const params = new HttpParams()
      .set('carpeta_id', carpetaId.toString())
      .set('uid', user.uid);

    const httpOptions = { params: params };

    console.log('[NotaService] Enviando GET a:', this.apiUrl, 'con params:', params.toString());
    return this.http.get<{ notes: Nota[] }>(this.apiUrl, httpOptions)
      .pipe(
        map(response => response.notes || []),
        tap(notas => console.log(`[NotaService] Notas recibidas para carpeta ${carpetaId}:`, notas)),
        catchError(this.handleError) // Usar el manejador de errores común
      );
  }

  crearNota(carpetaId: number, contenido: string): Observable<NotaCreadaResponse> {
    console.log(`[NotaService] Creando nota en carpetaId: ${carpetaId}, contenido: "${contenido}"`);
    const user = this.authService.getCurrentUser();
    if (!user || !user.uid) {
      return throwError(() => new Error('Usuario no autenticado para crear nota.'));
    }

    const payload = {
      uid: user.uid,
      carpeta_id: carpetaId.toString(),
      contenido: contenido
    };
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

    return this.http.post<NotaCreadaResponse>(this.apiUrl, payload, httpOptions) // <--- CAMBIADO de this.baseUrl a this.apiUrl
      .pipe(
        tap(response => console.log('[NotaService] Respuesta crearNota:', response)),
        catchError(this.handleError)
      );
  }

  actualizarNota(notaId: number, nuevoContenido: string): Observable<any> {
    console.log(`[NotaService] Actualizando notaId: ${notaId}, nuevo contenido: "${nuevoContenido}"`);
    const user = this.authService.getCurrentUser();
    if (!user || !user.uid) {
      return throwError(() => new Error('Usuario no autenticado para actualizar nota.'));
    }

    const payload = {
      uid: user.uid,
      contenido: nuevoContenido
    };
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    const url = `${this.apiUrl}${notaId}/`; // <--- CAMBIADO de this.baseUrl a this.apiUrl

    return this.http.put<any>(url, payload, httpOptions)
      .pipe(
        tap(response => console.log('[NotaService] Respuesta actualizarNota:', response)),
        catchError(this.handleError)
      );
  }

  eliminarNota(notaId: number): Observable<any> {
    console.log(`[NotaService] Eliminando notaId: ${notaId}`);
    const user = this.authService.getCurrentUser();
    if (!user || !user.uid) {
      return throwError(() => new Error('Usuario no autenticado para eliminar nota.'));
    }

    const params = new HttpParams().set('uid', user.uid);
    const httpOptions = { params: params };
    const url = `${this.apiUrl}${notaId}/`; // <--- CAMBIADO de this.baseUrl a this.apiUrl

    return this.http.delete<any>(url, httpOptions)
      .pipe(
        tap(response => console.log('[NotaService] Respuesta eliminarNota:', response)),
        catchError(this.handleError)
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