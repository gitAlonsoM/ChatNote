//src\app\services\workspace-chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap, switchMap, map } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
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
  private baseWsUrl = 'ws://127.0.0.1:8000/ws/chat/';
  private socket$!: WebSocketSubject<any>;
  private messagesSubject = new Subject<WorkspaceChatMessage>();
  public messages$ = this.messagesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}


 public connect(workspaceId: number): void {
    // Always disconnect any existing socket to ensure a clean start for the new connection.
    this.disconnect();

    // Create a new Subject for each connection. This is the crucial fix.
    // It ensures that new subscribers listen to a fresh, active stream.
    this.messagesSubject = new Subject<WorkspaceChatMessage>();
    this.messages$ = this.messagesSubject.asObservable();
    
    console.log(`DEBUG: [WorkspaceChatService] Connecting to WebSocket for workspace ${workspaceId}`);
    this.socket$ = webSocket(this.getWebSocketUrl(workspaceId));

    this.socket$.pipe(
      tap(msg => console.log('DEBUG: [WorkspaceChatService] Message received from WebSocket:', msg)),
      catchError(e => {
        console.error('DEBUG: [WorkspaceChatService] WebSocket error:', e);
        // We let the stream complete on error, so a reconnect can be attempted.
        return throwError(() => e);
      })
    ).subscribe({
      next: msg => this.messagesSubject.next(msg),
      // The complete handler will be called when the socket is closed.
      complete: () => console.log(`DEBUG: [WorkspaceChatService] WebSocket stream for workspace ${workspaceId} completed.`)
    });
  }


 private getWebSocketUrl(workspaceId: number): string {
    // In a real app, you'd append an auth token here, e.g.,
    // return `${this.baseWsUrl}${workspaceId}/?token=...`;
    return `${this.baseWsUrl}${workspaceId}/`;
  }

  public sendMessage(payload: { message: string, uid: string, name: string, email: string }): void {
    if (this.socket$ && !this.socket$.closed) {
      console.log('DEBUG: [WorkspaceChatService] Sending message via WebSocket:', payload);
      this.socket$.next(payload);
    } else {
      console.error('DEBUG: [WorkspaceChatService] Cannot send message, socket is not connected or closed.');
    }
  }


  public disconnect(): void {
    if (this.socket$) {
      console.log('DEBUG: [WorkspaceChatService] Disconnecting WebSocket.');
      this.socket$.complete();
    }
    // No need to explicitly nullify socket$, the 'complete' call handles its state.
  }

  
  // --- HTTP method to get initial history ---
  getChatHistory(workspaceId: number): Observable<WorkspaceChatMessage[]> {
    const url = `${this.baseApiUrl}${workspaceId}/chat/`;
    return this.http.get<{ history: WorkspaceChatMessage[] }>(url).pipe(
      map(response => response.history),
      tap(history => console.log('DEBUG: [WorkspaceChatService] Initial history received via HTTP:', history)),
      catchError(this.handleHttpError)
    );
  }

  private handleHttpError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown HTTP error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server returned code ${error.status}, error message is: ${error.message}`;
    }
    console.error('DEBUG: [WorkspaceChatService] HTTP Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}