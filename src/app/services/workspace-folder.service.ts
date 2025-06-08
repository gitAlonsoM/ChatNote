//src\app\services\workspace-folder.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { WorkspaceTask } from './task.service';


export interface WorkspaceFolder {
  id: number;
  name: string;
}

export interface FolderContent {
  notes: WorkspaceNote[];
  tasks: WorkspaceTask[];
}

export interface WorkspaceNote {
  id: number;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkspaceFolderService {
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

  getFolders(workspaceId: number): Observable<WorkspaceFolder[]> {
    return this.executeRequest(uid => {
      const params = new HttpParams().set('uid', uid);
      return this.http.get<{ folders: WorkspaceFolder[] }>(`${this.apiUrl}${workspaceId}/folders/`, { params })
        .pipe(map(response => response.folders));
    });
  }

  createFolder(workspaceId: number, name: string): Observable<any> {
    return this.executeRequest(uid => {
      const payload = { uid, name };
      return this.http.post(`${this.apiUrl}${workspaceId}/folders/`, payload);
    });
  }
  
  renameFolder(workspaceId: number, folderId: number, name: string): Observable<any> {
    return this.executeRequest(uid => {
      const payload = { uid, name };
      return this.http.put(`${this.apiUrl}${workspaceId}/folders/${folderId}/`, payload);
    });
  }

  deleteFolder(workspaceId: number, folderId: number): Observable<any> {
    return this.executeRequest(uid => {
      const params = new HttpParams().set('uid', uid);
      return this.http.delete(`${this.apiUrl}${workspaceId}/folders/${folderId}/`, { params });
    });
  }

getFolderContent(workspaceId: number, folderId: number): Observable<FolderContent> {
    return this.executeRequest(uid => {
      const params = new HttpParams().set('uid', uid);
      // The API now returns an object with 'notes' and 'tasks' keys
      return this.http.get<FolderContent>(`${this.apiUrl}${workspaceId}/folders/${folderId}/notes/`, { params });
    });
  }

  createNote(workspaceId: number, folderId: number, content: string): Observable<any> {
    return this.executeRequest(uid => {
      const payload = { uid, content };
      return this.http.post(`${this.apiUrl}${workspaceId}/folders/${folderId}/notes/`, payload);
    });
  }

  updateNote(workspaceId: number, folderId: number, noteId: number, content: string): Observable<any> {
    return this.executeRequest(uid => {
      const payload = { uid, content };
      return this.http.put(`${this.apiUrl}${workspaceId}/folders/${folderId}/notes/${noteId}/`, payload);
    });
  }

  deleteNote(workspaceId: number, folderId: number, noteId: number): Observable<any> {
    return this.executeRequest(uid => {
      const params = new HttpParams().set('uid', uid);
      return this.http.delete(`${this.apiUrl}${workspaceId}/folders/${folderId}/notes/${noteId}/`, { params });
    });
  }

  private handleError(error: HttpErrorResponse) {
    const errorMessage = error.error?.message || error.error?.error || 'An unknown error occurred.';
    return throwError(() => new Error(errorMessage));
  }
}