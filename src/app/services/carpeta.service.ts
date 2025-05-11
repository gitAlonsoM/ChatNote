// src/app/services/carpeta.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators'; // Añadir map
import { AuthService } from './auth.service'; // Necesario para obtener el UID del usuario


export interface Carpeta { // Definir una interfaz para tus carpetas
  carpeta_id: number; // o string, según tu BD
  nombre: string;
  // user_id?: string; // Opcional
  // espacio_id?: number; // Opcional
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
}

  

