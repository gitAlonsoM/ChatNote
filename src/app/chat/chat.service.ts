// src/app/chat/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators'; // Importa switchMap
import { Platform } from '@ionic/angular';
import { Http } from '@capacitor-community/http';
import { AuthService } from '../services/auth.service'; // DEBUG: import AuthService


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
* **Prioriza la Intención del Usuario:** Analiza cuidadosamente si el mensaje del usuario es una conversación, una solicitud de lectura, o un nuevo apunte a guardar.
* **Respuestas JSON Estrictas:** Cuando debas responder con un JSON para las acciones (READ, REQUEST_FOLDERS_FOR_NOTE_CLASSIFICATION, o la posterior INSERT_IN_FOLDER que te pedirá el sistema), esa respuesta JSON DEBE SER *EXCLUSIVA Y ÚNICA*. No añadas ningún texto, saludo, comentario, explicación ni formato adicional antes o después del JSON. Solo el JSON.
* **Confirmaciones al Usuario:** Después de que una acción (READ o inserción de nota) se complete exitosamente (o falle), tu siguiente respuesta al usuario debe ser una confirmación clara y conversacional, basada en la información que el sistema te proporcione sobre el resultado.
* **Ambigüedad:** Si una solicitud es muy ambigua, pide clarificación al usuario antes de asumir una acción.
* **Carpeta "General":** Cuando el sistema te pida clasificar una nota y te dé la lista de carpetas, recuerda que si ninguna carpeta temática es adecuada, o si el usuario no tiene carpetas temáticas, la nota debe ir a la carpeta "General" (debes seleccionar su ID).
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


  private backendApiUrl: string; // Ya no se inicializa aquí directamente


  constructor(
    private http: HttpClient,
    private platform: Platform,
    private authService: AuthService // DEBUG: inject AuthService to obtain UID
  ) { 
 // Determinar la URL del backend según la plataforma
    if (this.platform.is('android') && !this.platform.is('mobileweb')) {
      // Para emulador Android nativo, usa 10.0.2.2 para acceder al localhost del host
      this.backendApiUrl = 'http://10.0.2.2:8000/api/llm/';
      console.log('DEBUG: [ChatService] Running on Android native. Backend API URL for LLM:', this.backendApiUrl); // DEBUG
    } else {
      // Para web (ionic serve) u otras plataformas
      this.backendApiUrl = 'http://127.0.0.1:8000/api/llm/';
      console.log('DEBUG: [ChatService] Running on Web/Other. Backend API URL for LLM:', this.backendApiUrl); // DEBUG
    }
  }

  sendMessageToLLM(messages: { role: string; content: string }[]): Observable<any> { //metodo para el LLM, retorna un observable para manejar la respuesta
    // Usamos switchMap para esperar a que la promesa de getCurrentUser() se resuelva
    return from(this.authService.getCurrentUser()).pipe(
      switchMap(user => { // 'user' es ahora el objeto User o null, no la promesa
        const uid = user?.uid; // DEBUG: retrieve current user's UID
        console.log(`DEBUG: Sending message with UID=${uid}`); // DEBUG: log UID on each call

       const headers: { [key: string]: string } = { // Tipado explícito para headers
          'Content-Type': 'application/json',
        };

        const messagesWithSystemPrompt = [
          { role: 'system', content: this.systemPrompt },
          ...messages,
        ];

        const email = user?.email; // DEBUG: retrieve current user's email

        const body = {
          uid: uid,
          email: email, // DEBUG: include email in request payload
          messages: messagesWithSystemPrompt,
        };

        // DEBUG: Imprime en consola el system prompt y los mensajes que se enviarán
        console.log("DEBUG: Custom Instruction (system prompt):", this.systemPrompt);
        console.log("DEBUG: Mensajes enviados:", messages);


        if (this.platform.is('hybrid') && !this.platform.is('mobileweb')) { // Más específico para Android Nativo
          // Ejecutándose en dispositivo o emulador Android
          // Para @capacitor-community/http, asegúrate de que 'params' no sea 'undefined' si el plugin no lo maneja bien.
          // Aunque para POST con 'data', 'params' usualmente no se usa, el plugin podría tener una expectativa.
          // Sin embargo, la causa más probable del NPE en setUrlParams es si 'params' se pasa y es null o undefined
          // y el plugin intenta iterar sus keys.
          // Vamos a pasar 'data' directamente como segundo argumento y 'headers' en un objeto de opciones.
          // La firma de Http.post es: post<T = any>(options: HttpOptions): Promise<HttpResponse>;
          // donde HttpOptions tiene url, data, params, headers.

          const postOptions: import('@capacitor-community/http').HttpOptions = { // Tipado explícito para claridad
            url: this.backendApiUrl,
            headers: headers,
            data: body, // El cuerpo de la solicitud POST
          params: {} //
          };
          console.log('DEBUG: [ChatService] Native HTTP POST. Options:', JSON.stringify(postOptions, null, 2)); // DEBUG: Muestra el objeto options completo

          return from(Http.post(postOptions)).pipe( // Pasar el objeto postOptions
            tap(response => {
              console.log('DEBUG: [ChatService] Native HTTP response:', response); // DEBUG
              // Asegúrate de que la respuesta tenga el formato esperado
              if (response.status !== 200 && response.status !== 201) {
                console.warn('DEBUG: [ChatService] Native HTTP response with status:', response.status); // DEBUG
              }
            }),
            catchError((error) => {
              console.error('DEBUG: [ChatService] Error en Native HTTP POST:', error); // DEBUG
              // El error de Capacitor/Http puede ser un objeto con 'message', 'status', etc.
              let errorMsgForUser = 'Error de conexión con el asistente.';
              if (error && error.message) {
                if (error.message.includes("NullPointerException")) {
                  errorMsgForUser = "Error interno (NPE) al procesar la solicitud HTTP. Revisa los logs.";
                  console.error("DEBUG: [ChatService] NullPointerException in Http plugin. Details:", JSON.stringify(error, null, 2)); // DEBUG
                } else if (error.message.includes("Cleartext HTTP")) {
                    errorMsgForUser = "Error de seguridad: Tráfico HTTP no permitido.";
                    console.error("DEBUG: [ChatService] Specific Cleartext HTTP error. Check network_security_config.xml and AndroidManifest.xml"); // DEBUG
                } else if (error.status === 0 || error.message.includes("ERR_CONNECTION_REFUSED") || error.message.includes("Unable to resolve host")) {
                    errorMsgForUser = "No se pudo conectar al servidor. Verifica que el backend esté corriendo en 10.0.2.2:8000 y la red del emulador.";
                    console.error("DEBUG: [ChatService] Specific Connection/Resolution error. Is backend running on 10.0.2.2:8000?", error); // DEBUG
                } else {
                    errorMsgForUser = `Error: ${error.message}`;
                }
              } else if (typeof error === 'string') {
                errorMsgForUser = error;
              }
              // alert(`Error al enviar mensaje: ${errorMsgForUser}`); // Evitar alert, usar Toast.
              return throwError(() => new Error(errorMsgForUser));
            })
          );

        } else {
          const httpHeaders = new HttpHeaders(headers);
          console.log('DEBUG: [ChatService] Web HTTP POST. URL:', this.backendApiUrl, 'Headers:', httpHeaders, 'Body Keys:', Object.keys(body)); // DEBUG
          return this.http.post(this.backendApiUrl, body, { headers: httpHeaders }).pipe(
            tap(response => console.log('DEBUG: [ChatService] Web HTTP response:', response)), // DEBUG
            catchError((error: HttpErrorResponse) => { // Tipar el error para mejor manejo
              console.error('DEBUG: [ChatService] Error en Web HTTP POST:', error); // DEBUG
              let errorMsg = 'Error de red o del servidor.';
              if (error.status === 0) {
                errorMsg = 'No se pudo conectar al servidor. ¿Está el backend Django corriendo en 127.0.0.1:8000?';
                 console.error("DEBUG: [ChatService] Specific Connection Refused error (web). Is backend running on 127.0.0.1:8000?"); // DEBUG
              } else if (error.error && typeof error.error.error === 'string') {
                errorMsg = error.error.error; // Si el backend envía un mensaje de error JSON
              } else if (error.message) {
                errorMsg = error.message;
              }
              return throwError(() => new Error(errorMsg)); // Propagar un error más descriptivo
            })
          );
        }
      })
    );
  }
}



