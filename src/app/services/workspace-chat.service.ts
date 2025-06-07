//src\app\services\workspace-chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { Http } from '@capacitor-community/http';
import { AuthService } from './auth.service';

export interface WorkspaceChatMessage {
  authorId: string;
  authorName: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkspaceChatService {
  private baseApiUrl = 'http://127.0.0.1:8000/api/workspaces/';
  private readonly _defaultPrompt: string = `Eres un asistente de IA en un chat colaborativo. Tu comportamiento debe ser neutral y objetivo. No tienes acceso al contenido de las carpetas de este espacio, solo puedes mantener conversaciones generales.`;

  constructor(
    private http: HttpClient,
    private platform: Platform,
    private authService: AuthService
  ) {}

  getChatHistory(workspaceId: number): Observable<WorkspaceChatMessage[]> {
    console.log(`DEBUG: [WorkspaceChatService] getChatHistory for workspace ${workspaceId}`);
    const url = `${this.baseApiUrl}${workspaceId}/chat/`;
    return this.http.get<{ history: WorkspaceChatMessage[] }>(url).pipe(
      tap(response => console.log('DEBUG: [WorkspaceChatService] History received:', response.history)),
      switchMap(response => from([response.history])),
      catchError(this.handleError)
    );
  }

  sendMessageToLLM(workspaceId: number, messages: { role: string; content: string }[]): Observable<any> {
    console.log(`DEBUG: [WorkspaceChatService] sendMessageToLLM for workspace ${workspaceId}`);
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          return throwError(() => new Error('User not authenticated.'));
        }
        
        const url = `${this.baseApiUrl}${workspaceId}/chat/`;
        const headers = { 'Content-Type': 'application/json' };
        
        const body = {
          uid: user.uid,
          email: user.email,
          messages: [
            { role: 'system', content: this._defaultPrompt },
            ...messages,
          ],
        };

        console.log("DEBUG: [WorkspaceChatService] Sending POST to", url, "Body:", body);
        return this.http.post(url, body, { headers }).pipe(
          tap(response => console.log('DEBUG: [WorkspaceChatService] LLM response received:', response)),
          catchError(this.handleError)
        );
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Server returned code ${error.status}, error message is: ${error.message}`;
    }
    console.error('DEBUG: [WorkspaceChatService] handleError:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
