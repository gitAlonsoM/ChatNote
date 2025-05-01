// src/app/chat/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { Http } from '@capacitor-community/http';

@Injectable({
  providedIn: 'root',
})


export class ChatService {

  
   private readonly _defaultPrompt: string = `
Eres una asistente virtual experta en organizar tareas y responder consultas. 
Tu comportamiento se divide en dos modos:

1. **Modo Conversacional:** Si el usuario formula preguntas o conversaciones generales, responde de forma natural y conversacional.

2. **Modo READ:** Si el usuario dice expresiones como "leer las tareas", "read", "lee la tabla", "muéstrame las tareas", o cualquier variante que implique consultar tareas, DEBES responder *únicamente* con el siguiente JSON exacto y sin ningún texto adicional:
   { "action": "READ" }

**IMPORTANTE:** No incluyas ningún otro contenido o formato extra. Si la solicitud es para ver tareas, tu respuesta debe ser *solo*:
   { "action": "READ" }

Usa este esquema para determinar tu respuesta.
    `;
   private systemPrompt: string = this._defaultPrompt;
   
   public updateSystemPrompt(newPrompt: string): void {

    const reinforcementText = `Asumiras que la ubicacion en coordenadas que te llega es en donde esta el usuario en ese momento y le entregaras informacion relevante con esa ubicacion. Tambien te encargaras de organizar tareas que el usuario puede enviarte, cuando te envie un listado de tareas, asumiras que son tareas que el usuario a guardado, y le ayudaras a organizarse mejor en sus quehaceres. Importante: En cuanto a tu personalidad y otras tareas que puedas cumplir seguiras extricamente lo siguiente en cada conversacion y no abandonaras nunca el ROL:\n\n`;
    this.systemPrompt = reinforcementText + newPrompt;
   }
   
   public getDefaultPrompt(): string {
     return this._defaultPrompt;
   }
   //NEW CUSTOM INSTRUCTION - Fin actualización de ChatService


/*   private apiUrl = 'https://api.openai.com/v1/chat/completions'; //Endpoint
  private apiKey = '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';
 */

  private backendApiUrl = 'http://127.0.0.1:8000/api/llm/'; 

/* 
  private apiParams = {     //objeto literal{} (clave(propiedades)/valor)
    model: 'gpt-4o-mini',   //gpt-4, gpt-4-turbo, gpt-4o-mini, gpt-3.5-turbo
    temperature: 1,         //(0(determinista) a 2(creativo)
    max_tokens: 150,
    frequency_penalty: 0.3, //(-2.0 a 2.0). valores altos penalizan repeticion de palabras
    presence_penalty: 0,    //(-2.0 a 2.0.)Favorece palabras nuevas
    top_p: 1,               //0 a 1.
  };
 */

  constructor(private http: HttpClient, private platform: Platform) {} 




  sendMessageToLLM(messages: { role: string; content: string }[]): Observable<any> { //metodo para el LLM, retorna un observable para manejar la respuesta
    
    const headers = {
      'Content-Type': 'application/json',
    /*   'Authorization': `Bearer ${this.backendApiUrl}`, */
    };

    const messagesWithSystemPrompt = [
      { role: 'system', content: this.systemPrompt },
      ...messages,
    ];


    const body = {
      /* ...this.apiParams, */
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





