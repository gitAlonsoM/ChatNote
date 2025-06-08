// src/app/services/activity-log.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ActivityLogEntry {
  timestamp: string;
  userName: string;
  detail: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private apiUrlBase = 'http://127.0.0.1:8000/api/workspaces/';

  constructor(private http: HttpClient) {}

  getWorkspaceActivityLog(workspaceId: number): Observable<ActivityLogEntry[]> {
    const url = `${this.apiUrlBase}${workspaceId}/activity-log/`;
    return this.http.get<{ activity_log: ActivityLogEntry[] }>(url).pipe(
      map(response => response.activity_log),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    const errorMessage = error.error?.error || 'An unknown error occurred while fetching the activity log.';
    return throwError(() => new Error(errorMessage));
  }
}