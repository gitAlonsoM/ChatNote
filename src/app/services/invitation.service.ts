//src\app\services\invitation.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, tap, switchMap, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

// Interface for the invitation data received from the backend
export interface Invitation {
  espacio_id: number;
  nombre_espacio: string;
  invited_by_id: string;
  nombre_invitador: string;
  invitation_date: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private apiUrlBase = 'http://127.0.0.1:8000/api/'; // Base API URL

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Invites a user to a workspace by their email.
   * @param workspaceId The ID of the workspace to invite to.
   * @param email The email of the user being invited.
   * @returns Observable with the backend response.
   */
  inviteUser(workspaceId: number, email: string): Observable<any> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          return throwError(() => new Error('User not authenticated.'));
        }
        const url = `${this.apiUrlBase}workspaces/${workspaceId}/invitations/`;
        const payload = { uid: user.uid, email: email };
        console.log('DEBUG: [InvitationService] Sending POST to:', url, 'Payload:', payload);
        return this.http.post<any>(url, payload).pipe(catchError(this.handleError));
      })
    );
  }

  /**
   * Gets pending invitations for the currently logged-in user.
   * @returns Observable with an array of Invitation objects.
   */
  getPendingInvitations(): Observable<Invitation[]> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          return throwError(() => new Error('User not authenticated.'));
        }
        const params = new HttpParams().set('uid', user.uid);
        const url = `${this.apiUrlBase}invitations/`;
        console.log('DEBUG: [InvitationService] Sending GET to:', url);
        return this.http.get<{ invitations: Invitation[] }>(url, { params }).pipe(
          map(response => response.invitations),
          catchError(this.handleError)
        );
      })
    );
  }

  /**
   * Responds to a pending invitation.
   * @param workspaceId The ID of the workspace related to the invitation.
   * @param response The user's response: 'ACEPTADO' or 'RECHAZADO'.
   * @returns Observable with the backend response.
   */
  respondToInvitation(workspaceId: number, response: 'ACEPTADO' | 'RECHAZADO'): Observable<any> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          return throwError(() => new Error('User not authenticated.'));
        }
        const url = `${this.apiUrlBase}invitations/${workspaceId}/`;
        const payload = { uid: user.uid, response: response };
        console.log('DEBUG: [InvitationService] Sending PUT to:', url, 'Payload:', payload);
        return this.http.put<any>(url, payload).pipe(catchError(this.handleError));
      })
    );
  }

  /**
   * Allows a user to leave a workspace they are a member of.
   * @param workspaceId The ID of the workspace to leave.
   * @returns Observable with the backend response.
   */
  leaveWorkspace(workspaceId: number): Observable<any> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          return throwError(() => new Error('User not authenticated.'));
        }
        const url = `${this.apiUrlBase}workspaces/${workspaceId}/membership/`;
        const httpOptions = {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          body: { uid: user.uid }
        };
        console.log('DEBUG: [InvitationService] Sending DELETE to:', url, 'Body:', httpOptions.body);
        return this.http.delete<any>(url, httpOptions).pipe(catchError(this.handleError));
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('DEBUG: [InvitationService] handleError:', error);
    const userMessage = error.error?.message || error.statusText || 'Ocurrió un error desconocido en el servidor.';
    return throwError(() => new Error(userMessage));
  }
}