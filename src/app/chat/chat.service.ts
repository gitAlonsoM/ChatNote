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

  
   //NEW CUSTOM INSTRUCTION - Inicio actualización de ChatService
   private readonly _defaultPrompt: string = `Actúa como una secretaria eficiente que se encarga de recibir y organizar tareas, analizar ubicacion en coordenadas, conversaciones amistosas, etc.`;
  
   private systemPrompt: string = this._defaultPrompt;
   
   public updateSystemPrompt(newPrompt: string): void {

    const reinforcementText = `Asumiras que la ubicacion en coordenadas que te llega es en donde esta el usuario en ese momento y le entregaras informacion relevante con esa ubicacion. Tambien te encargaras de organizar tareas que el usuario puede enviarte, cuando te envie un listado de tareas, asumiras que son tareas que el usuario a guardado, y le ayudaras a organizarse mejor en sus quehaceres. Importante: En cuanto a tu personalidad y otras tareas que puedas cumplir seguiras extricamente lo siguiente en cada conversacion y no abandonaras nunca el ROL:\n\n`;
    this.systemPrompt = reinforcementText + newPrompt;
   }
   
   public getDefaultPrompt(): string {
     return this._defaultPrompt;
   }
   //NEW CUSTOM INSTRUCTION - Fin actualización de ChatService


  private apiUrl = 'https://api.openai.com/v1/chat/completions'; //Endpoint
  private apiKey = '';


  private apiParams = {     //objeto literal{} (clave(propiedades)/valor)
    model: 'gpt-4o-mini',   //gpt-4, gpt-4-turbo, gpt-4o-mini, gpt-3.5-turbo
    temperature: 1,         //(0(determinista) a 2(creativo)
    max_tokens: 150,
    frequency_penalty: 0.3, //(-2.0 a 2.0). valores altos penalizan repeticion de palabras
    presence_penalty: 0,    //(-2.0 a 2.0.)Favorece palabras nuevas
    top_p: 1,               //0 a 1.
  };


  constructor(private http: HttpClient, private platform: Platform) {} 




  sendMessageToLLM(messages: { role: string; content: string }[]): Observable<any> { //metodo para el LLM, retorna un observable para manejar la respuesta
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const messagesWithSystemPrompt = [
      { role: 'system', content: this.systemPrompt },
      ...messages,
    ];


    const body = {
      ...this.apiParams,
      messages: messagesWithSystemPrompt,
    };

       // DEBUG: Imprime en consola el system prompt y los mensajes que se enviarán
       console.log("DEBUG: Custom Instruction (system prompt):", this.systemPrompt);
       console.log("DEBUG: Mensajes enviados:", messages);

       
    if (this.platform.is('hybrid')) {
      // Ejecutándose en dispositivo o emulador
      const options = {
        url: this.apiUrl || '',
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
      return this.http.post(this.apiUrl, body, { headers: httpHeaders }).pipe(
        catchError((error) => {
          console.error('Error al enviar mensaje al LLM:', error);
          return throwError(() => error);
        })
      );
    }
  }
}








/*

*Injectable:
Decorador de Angular que permite que una clase sea inyectable como un servicio en otros componentes o servicios de la aplicación
En lugar de @Component, los servicios usan el decorador @Injectable que indica que esta clase puede ser inyectada como una dependencia en otros componentes o servicios.

*HttpClient:
Forma parte del módulo HTTP de Angular (@angular/common/http). Se utiliza para hacer solicitudes HTTP (GET, POST, PUT, DELETE, etc.) a servidores web.

*HttpHeaders: 
Clase de Angular que permite definir encabezados HTTP personalizados. En este caso, se utiliza para incluir la clave API (Authorization) y el tipo de contenido (Content-Type).

*Observable (RxJS = Reactive Extensions for JavaScript):
En el código, el Observable maneja la respuesta asíncrona de la API y se accede mediante subscribe. Este método procesa los datos de la respuesta (como response) o maneja errores, ejecutándose solo cuando te suscribes al Observable. "Es el metodo que ocupa angular para manejar API".

*endpoint:
es una URL específica dentro de una API a la que se envían solicitudes para interactuar con un servicio o recurso. 


*apiParams
La estructura que usa es un "objeto" de JS.
Un objeto es una colección de pares clave-valor. En este caso, apiParams es un objeto con varias propiedades o claves; como model, temperature, max_tokens, etc., cada una con su propio valor.


*Solicitud HTTP POST es un tipo de petición o request
que se hace desde algun SW a un servidor para enviar datos y recibir una respuesta.

*HTTP (HyperText Transfer Protocol) 
es el protocolo que define cómo los datos son transmitidos 
entre un cliente (como un navegador web o aplicación) y un servidor 
(el lugar donde están almacenados los datos o la lógica que quieres usar).

*POST 
es uno de los métodos más utilizados para enviar datos al servidor, 
sobre todo cuando quieres que el servidor procese estos datos. En una solicitud POST, 
los datos son enviados dentro del cuerpo de la solicitud.


*Token:
En el contexto de los modelos de lenguaje como GPT es una unidad básica de texto. Los tokens pueden ser palabras, partes de palabras o incluso signos de puntuación.
Signos de puntuación también cuentan como tokens, como el punto final (.) o comas.
Algunas palabras largas o compuestas pueden contar como varios tokens.

Ejemplos de tokens:
  apple → 1 token.
  don't → 2 tokens (do + n't).

  I love pizza. → 4 tokens.
          I     → 1 token.
          love  → 1 token.
          pizza → 1 token.
      . (punto) → 1 token.

*/


