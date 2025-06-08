//src\app\services\task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { HttpErrorResponse } from '@angular/common/http';

export interface WorkspaceTask {
  id: number;
  note_id: number;
  content: string;
  description: string;
  due_date: string | null;
  assignee_id: string;
  assignee_name: string;
  author_id: string;
  author_name: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://127.0.0.1:8000/api/workspaces/';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private executeRequest<T>(request: (uid: string) => Observable<T>): Observable<T> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          return throwError(() => new Error('User not authenticated.'));
        }
        return request(user.uid);
      }),
      catchError(this.handleError)
    );
  }

  assignTask(
    workspaceId: number, 
    folderId: number, 
    noteId: number, 
    assigneeId: string, 
    description: string, 
    dueDate: string | null
  ): Observable<any> {
    return this.executeRequest(uid => {
      const payload = { 
        uid: uid, // assigner_id
        assignee_id: assigneeId, 
        description, 
        due_date: dueDate 
      };
      const url = `${this.apiUrl}${workspaceId}/folders/${folderId}/notes/${noteId}/assign-task/`;
      return this.http.post(url, payload);
    });
  }

  updateTask(
    workspaceId: number, 
    taskId: number, 
    assigneeId: string, 
    description: string, 
    dueDate: string | null
  ): Observable<any> {
    return this.executeRequest(uid => {
      const payload = { 
        uid, // for audit
        assignee_id: assigneeId,
        description,
        due_date: dueDate
      };
      const url = `${this.apiUrl}${workspaceId}/tasks/${taskId}/`;
      return this.http.put(url, payload);
    });
  }

  deleteTask(workspaceId: number, taskId: number): Observable<any> {
    return this.executeRequest(uid => {
      const params = new HttpParams().set('uid', uid);
      const url = `${this.apiUrl}${workspaceId}/tasks/${taskId}/`;
      return this.http.delete(url, { params });
    });
  }

  private handleError(error: HttpErrorResponse) {
    const errorMessage = error.error?.message || error.error?.error || 'An unknown error occurred.';
    return throwError(() => new Error(errorMessage));
  }
}