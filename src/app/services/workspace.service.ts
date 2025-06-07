//src\app\services\workspace.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, tap, switchMap, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

// Interfaces para tipar los datos de Workspace
export interface Workspace {
  espacio_id: number;
  nombre: string;
  owner_id: string;
  nombre_owner?: string; 
  rol_usuario_en_espacio?: string; 
  es_owner_solicitante?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceMember {
  user_id: string;
  nombre_usuario: string;
  email: string;
  rol_en_espacio: string;
  es_owner_espacio: boolean;
  invitation_date?: string;
  nombre_invitador?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private apiUrlBase = 'http://127.0.0.1:8000/api/workspaces/';

  constructor(private http: HttpClient, private authService: AuthService) {
    console.log('DEBUG: [WorkspaceService] Constructor. API URL Base:', this.apiUrlBase);
  }

  createWorkspace(nombreEspacio: string): Observable<any> {
    console.log('DEBUG: [WorkspaceService] createWorkspace. Nombre:', nombreEspacio);
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          return throwError(() => new Error('User not authenticated. Cannot create workspace.'));
        }
        const payload = { uid: user.uid, nombre_espacio: nombreEspacio };
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        
        console.log('DEBUG: [WorkspaceService] createWorkspace - Sending POST to:', this.apiUrlBase, 'Payload:', payload);
        return this.http.post<any>(this.apiUrlBase, payload, httpOptions).pipe(
          tap(response => console.log('DEBUG: [WorkspaceService] createWorkspace - Success response:', response)),
          catchError(this.handleError)
        );
      })
    );
  }

  listUserWorkspaces(): Observable<Workspace[]> {
    console.log('DEBUG: [WorkspaceService] listUserWorkspaces');
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          return throwError(() => new Error('User not authenticated. Cannot list workspaces.'));
        }
        const params = new HttpParams().set('uid', user.uid);
        console.log('DEBUG: [WorkspaceService] listUserWorkspaces - Sending GET to:', this.apiUrlBase, 'Params:', params.toString());
        return this.http.get<{ workspaces: Workspace[] }>(this.apiUrlBase, { params }).pipe(
          map(response => response.workspaces),
          tap(workspaces => console.log('DEBUG: [WorkspaceService] listUserWorkspaces - Workspaces received:', workspaces)),
          catchError(this.handleError)
        );
      })
    );
  }

  getWorkspaceDetails(workspaceId: number): Observable<Workspace> {
    console.log('DEBUG: [WorkspaceService] getWorkspaceDetails. WorkspaceID:', workspaceId);
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          return throwError(() => new Error('User not authenticated. Cannot get workspace details.'));
        }
        const params = new HttpParams().set('uid', user.uid); 
        const url = `${this.apiUrlBase}${workspaceId}/`;
        console.log('DEBUG: [WorkspaceService] getWorkspaceDetails - Sending GET to:', url, 'Params:', params.toString());
        return this.http.get<Workspace>(url, { params }).pipe(
          tap(details => console.log('DEBUG: [WorkspaceService] getWorkspaceDetails - Details received:', details)),
          catchError(this.handleError)
        );
      })
    );
  }

  renameWorkspace(workspaceId: number, nuevoNombre: string): Observable<any> {
    console.log('DEBUG: [WorkspaceService] renameWorkspace. WorkspaceID:', workspaceId, 'NuevoNombre:', nuevoNombre);
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          return throwError(() => new Error('User not authenticated. Cannot rename workspace.'));
        }
        const payload = { uid: user.uid, nombre_espacio_nuevo: nuevoNombre };
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        const url = `${this.apiUrlBase}${workspaceId}/`;
        console.log('DEBUG: [WorkspaceService] renameWorkspace - Sending PUT to:', url, 'Payload:', payload);
        return this.http.put<any>(url, payload, httpOptions).pipe(
          tap(response => console.log('DEBUG: [WorkspaceService] renameWorkspace - Success response:', response)),
          catchError(this.handleError)
        );
      })
    );
  }

  deleteWorkspace(workspaceId: number): Observable<any> {
    console.log('DEBUG: [WorkspaceService] deleteWorkspace. WorkspaceID:', workspaceId);
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          return throwError(() => new Error('User not authenticated. Cannot delete workspace.'));
        }
        const params = new HttpParams().set('uid', user.uid); 
        const url = `${this.apiUrlBase}${workspaceId}/`;
        console.log('DEBUG: [WorkspaceService] deleteWorkspace - Sending DELETE to:', url, 'Params:', params.toString());
        return this.http.delete<any>(url, { params }).pipe(
          tap(response => console.log('DEBUG: [WorkspaceService] deleteWorkspace - Success response:', response)),
          catchError(this.handleError)
        );
      })
    );
  }

  listWorkspaceMembers(workspaceId: number): Observable<WorkspaceMember[]> {
    console.log('DEBUG: [WorkspaceService] listWorkspaceMembers. WorkspaceID:', workspaceId);
  
    const url = `${this.apiUrlBase}${workspaceId}/members/`;
    console.log('DEBUG: [WorkspaceService] listWorkspaceMembers - Sending GET to:', url);
    return this.http.get<{ members: WorkspaceMember[] }>(url).pipe(
      map(response => response.members),
      tap(members => console.log('DEBUG: [WorkspaceService] listWorkspaceMembers - Members received:', members)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {

      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`);
      errorMessage = `Server error: ${error.status}. `;
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage += error.error.message;
      } else if (error.error && typeof error.error === 'string') {
         errorMessage += error.error;
      } else if (error.message) {
        errorMessage += error.message;
      }
    }
    console.error('DEBUG: [WorkspaceService] handleError:', errorMessage, 'Full error object:', error);
    return throwError(() => new Error(errorMessage));
  }
}