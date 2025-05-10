// src/app/chat/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { Http } from '@capacitor-community/http';
import { AuthService } from '../services/auth.service';  // DEBUG: import AuthService


@Injectable({
  providedIn: 'root',
})

export class ChatService {

private readonly _defaultPrompt: string = `
Eres una asistente virtual experta en organizar tareas y responder consultas.
Tu comportamiento se divide en tres modos:

1. **Modo Conversacional:** Si el usuario formula preguntas o conversaciones generales, responde de forma natural y conversacional.

2. **Modo READ:** Si el usuario solicita ver sus tareas (“leer tareas”, “mostrar tareas”, etc.), DEBES responder *únicamente* con:
   { "action": "READ" }

3. **Modo INSERT:** Si el usuario solicita crear una nueva nota o tarea (“agrega”, “inserta”, “nueva nota”, etc.), DEBES responder *únicamente* con este JSON exacto
  Debes agregar en "contenido" la información clara y directa que el usuario quiere guardar:
   {
     "action": "INSERT",
    "contenido": "<texto completo de la nota>"
   }

IMPORTANTE: No agregues ningún texto adicional, comentarios ni otro formato; solo el JSON cuando tus acciones no es conversar.
  `;
   private systemPrompt: string = this._defaultPrompt;

  public updateSystemPrompt(newPrompt: string): void {
    const reinforcementText = `
Asumirás que la ubicación que recibes es del usuario y entregarás información relevante.
También organizarás tareas que el usuario te envíe.
IMPORTANTE: Mantén siempre la estructura de modos (READ e INSERT) y no abandones tu rol.\n\n`;
    this.systemPrompt = this._defaultPrompt + reinforcementText + newPrompt;
  }
   
   public getDefaultPrompt(): string {
     return this._defaultPrompt;
   }


  private backendApiUrl = 'http://127.0.0.1:8000/api/llm/'; 

  constructor(
    private http: HttpClient,
    private platform: Platform,
    private authService: AuthService    // DEBUG: inject AuthService to obtain UID
  ) {}




  sendMessageToLLM(messages: { role: string; content: string }[]): Observable<any> { //metodo para el LLM, retorna un observable para manejar la respuesta
    const uid = this.authService.getCurrentUser()?.uid;                // DEBUG: retrieve current user's UID
    console.log(`DEBUG: Sending message with UID=${uid}`);             // DEBUG: log UID on each call

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.backendApiUrl}`,
    };

    const messagesWithSystemPrompt = [
      { role: 'system', content: this.systemPrompt },
      ...messages,
    ];

    const email = this.authService.getCurrentUser()?.email;  // DEBUG: retrieve current user's email

    const body = {
      uid: uid,
      email: email,                      // DEBUG: include email in request payload
      messages: messagesWithSystemPrompt,
    };

       // DEBUG: Imprime en consola el system prompt y los mensajes que se enviarán
       console.log("DEBUG: Custom Instruction (system prompt):", this.systemPrompt);
       console.log("DEBUG: Mensajes enviados:", messages);

       
    if (this.platform.is('hybrid')) {
      // Ejecutándose en dispositivo o emulador
      const options = {
        url: this.backendApiUrl || '',
        headers: headers,
        data: body || {},
        params: {}, // Agregar un objeto params vacío
      };

      return from(Http.post(options)).pipe( //retorna la respuesta de la api como post, 
        catchError((error) => {  //Depuracion en caso de errores
          console.error('Error al enviar mensaje al LLM:', error); 
          alert(`Error al enviar mensaje: ${JSON.stringify(error, null, 2)}`);
          console.log('URL:', options.url);
          console.log('Headers:', options.headers);
          console.log('Data:', options.data);
          return throwError(() => error);
        })
      );

    } else {
      // Ejecutándose en el navegador
      const httpHeaders = new HttpHeaders(headers);
      return this.http.post(this.backendApiUrl, body, { headers: httpHeaders }).pipe(
        catchError((error) => {
          console.error('Error al enviar mensaje al LLM:', error);
          return throwError(() => error);
        })
      );
    }
  }
}





