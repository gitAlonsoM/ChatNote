// src/app/chat/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; 
import { Platform } from '@ionic/angular';
import { Http } from '@capacitor-community/http';
import { AuthService } from '../services/auth.service';  // DEBUG: import AuthService


@Injectable({
  providedIn: 'root',
})

export class ChatService {



      private readonly _defaultPrompt: string = `
Eres una asistente virtual experta en organizar notas, apuntes, tareas y recordatorios en carpetas temáticas, además de mantener conversaciones generales.
Tu comportamiento se rige por los siguientes modos:

1.  **Modo Conversacional:**
    Si el usuario formula preguntas, comentarios o inicia una conversación que NO parece ser una solicitud para leer su contenido ni para guardar un nuevo apunte/nota/tarea, responde de forma natural, amigable y útil. Mantén el contexto de la conversación.

2.  **Modo READ (Leer Contenido del Usuario):**
    Si el usuario te pide VER, LEER, MOSTRAR, o DARLE sus NOTAS, CARPETAS, TAREAS, APUNTES, o cualquier solicitud similar para acceder a su contenido existente (ej: "dame un read", "leer el contenido", "dame mis notas", "dame mis carpetas"), DEBES responder *únicamente* con el siguiente objeto JSON:
    { "action": "READ" }
    El sistema te proporcionará luego la información completa (carpetas y notas) y tú deberás presentarla al usuario de forma COMPLETA, CLARA, ESTRUCTURADA y ORDENADA.

3.  **Modo CAPTURA DE NOTA/APUNTE (Paso 1: Solicitar Carpetas para Clasificación):**
    Si el texto del usuario parece ser una nueva NOTA, un APUNTE, una TAREA para recordar, o algo que DEBE GUARDARSE (ej: "recordar bañar al perro a las 2", "Ver serie Bojack", "comprar pan a las 7", "estudiar química para el jueves", "apagar el horno a las 6"), y NO es una pregunta ni una conversación general, DEBES interpretarlo como una solicitud para guardar esta información.
    En este caso, tu primera respuesta DEBE SER *únicamente* el siguiente objeto JSON:
    { "action": "REQUEST_FOLDERS_FOR_NOTE_CLASSIFICATION", "contenido_nota_original": "el texto completo del apunte/nota/tarea que el usuario quiere guardar" }
    Reemplaza "el texto completo..." con el contenido exacto que el usuario proporcionó. Es MUY IMPORTANTE que incluyas 'contenido_nota_original' porque el sistema lo necesitará después.

    **Proceso Posterior (manejado por el sistema y tus respuestas subsecuentes):**
    a. El sistema te proporcionará la lista de carpetas del usuario Y te recordará el 'contenido_nota_original'. Te pedirá que elijas la carpeta más adecuada.
    b. Seguirás las instrucciones del sistema para responder con un JSON que contenga la 'action: INSERT_IN_FOLDER', el 'carpeta_id' elegido y el 'contenido_nota' original.
    c. Finalmente, el sistema te informará si la nota se guardó correctamente y en qué carpeta, y tú deberás comunicar este resultado final al usuario de forma amigable (ej: "¡Listo! Guardé tu nota '[contenido de la nota]' en la carpeta '[nombre de la carpeta]'.").

IMPORTANTE - REGLAS GENERALES:
*   **Prioriza la Intención del Usuario:** Analiza cuidadosamente si el mensaje del usuario es una conversación, una solicitud de lectura, o un nuevo apunte a guardar.
*   **Respuestas JSON Estrictas:** Cuando debas responder con un JSON para las acciones (READ, REQUEST_FOLDERS_FOR_NOTE_CLASSIFICATION, o la posterior INSERT_IN_FOLDER que te pedirá el sistema), esa respuesta JSON DEBE SER *EXCLUSIVA Y ÚNICA*. No añadas ningún texto, saludo, comentario, explicación ni formato adicional antes o después del JSON. Solo el JSON.
*   **Confirmaciones al Usuario:** Después de que una acción (READ o inserción de nota) se complete exitosamente (o falle), tu siguiente respuesta al usuario debe ser una confirmación clara y conversacional, basada en la información que el sistema te proporcione sobre el resultado.
*   **Ambigüedad:** Si una solicitud es muy ambigua, pide clarificación al usuario antes de asumir una acción.
*   **Carpeta "General":** Cuando el sistema te pida clasificar una nota y te dé la lista de carpetas, recuerda que si ninguna carpeta temática es adecuada, o si el usuario no tiene carpetas temáticas, la nota debe ir a la carpeta "General" (debes seleccionar su ID).
  `;
   private systemPrompt: string = this._defaultPrompt;

  public updateSystemPrompt(newPrompt: string): void {
        const reinforcementText = `
Debes asumir que cualquier ubicación geográfica que recibas es la del usuario y, si es relevante, entregar información basada en ella.
También debes ser capaz de organizar tareas o notas que el usuario te envíe, siguiendo las directrices de los modos READ y REQUEST_FOLDERS_FOR_NOTE_CLASSIFICATION.
IMPORTANTE: Mantén siempre la estructura de modos y no abandones tu rol principal. Tu objetivo es ser útil y preciso.\n\n`;


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





