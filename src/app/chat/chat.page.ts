// src/app/chat/chat.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';
import { AuthService } from '../services/auth.service';
import { ToastController, Platform } from '@ionic/angular'; //Platform se usa para verificar si la app esta ejecutada en un entorno nativo
import { TaskService } from '../services/task.service';
import { Subscription } from 'rxjs'; // Importa Subscription para manejar observables
import { ChatStorageService, ChatMessage } from './chat-storage.service'; //NEW CHAT STORE
import { GeolocationService } from '../services/geolocation.service'; //Se importa el servicio
import { ViewChild, ElementRef } from '@angular/core';



//Decorador para declarar que es un Componente de Angular (pagina visual, interactuar con html, escuchar eventos de usuario, (UI),etc)
@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})


export class ChatPage implements OnInit, OnDestroy {

   //NEW SCROLL - Agregar ViewChild para el contenedor de mensajes
   @ViewChild('chatMessages', { static: false }) chatMessages!: ElementRef;

   //NEW SCROLL - Fin ViewChild


  //Propiedades de la clase
  userMessage: string = '';
  isLoggedIn: boolean = false;
  logoutButtonHidden: boolean = false;
  message: string = ''; // Mensaje emergente que se mostrara
  showMessage: boolean = false; //controlar la visibilidad de mensajes emergentes
  private authSubscription: Subscription | null = null; // Inicializado a null


  // Inicializar el array de mensajes con el mensaje del asistente. 
  messages = [{ role: 'assistant',  //propiedad-valor
                content: 'Hola, ¿En qué puedo ayudarte?' }];

  constructor( //propiedades o dependencias inyectadas en la clase para ser usadas dentro de sus métodos. 
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService,
    private toastController: ToastController,
    private taskService: TaskService,
    private platform: Platform,
    private geolocationService: GeolocationService,
    private chatStorageService: ChatStorageService  //NEW CHAT STORE

  ) {}


  //NEW SCROLL - Método para desplazar el scroll al final
  private scrollToBottom(): void {
    setTimeout(() => {
      if(this.chatMessages) {
        this.chatMessages.nativeElement.scrollTop = this.chatMessages.nativeElement.scrollHeight;
      }
    }, 100);
  }
  //NEW SCROLL - Fin método
  

  async sendLocation() {
    try {
      const coords = await this.geolocationService.getCurrentPosition();
      const locationMessage = `Mis coordenadas son: ${coords.latitude}, ${coords.longitude}. ¿Puedes decirme en qué ciudad y país me encuentro basado en estas coordenadas?`;
      console.log(locationMessage); // Debugging

      // Agrega el mensaje al array de chat para que se muestre en la interfaz de usuario el mensaje "enviado ubicacion"
      this.messages.push({ role: 'user', content: 'Enviando ubicación...' });
      //NEW CHAT STORE
      this.chatStorageService.saveMessages(this.messages);
      //NEW CHAT STORE
      // Prepara el mensaje para el formato esperado por sendMessageToLLM
      const messageToSend = [
        {
          role: 'user',
          content: locationMessage,
        },
      ];

      // Envía el mensaje al LLM y espera la respuesta
      this.chatService.sendMessageToLLM(messageToSend).subscribe(
        (response) => {
          // Manejar la respuesta dependiendo del entorno
          let botReplyContent: string;

          if (this.platform.is('hybrid')) {
            // Entorno nativo
            const responseData = response.data;
            console.log('Respuesta del LLM:', responseData);
            if (
              responseData &&
              responseData.choices &&
              responseData.choices.length > 0
            ) {
              botReplyContent = responseData.choices[0].message.content;
            } else {
              botReplyContent = 'Error al interpretar la respuesta del LLM.';
            }
          } else {
            // En el navegador
            console.log('Respuesta del LLM:', response);
            if (response && response.choices && response.choices.length > 0) {
              botReplyContent = response.choices[0].message.content;
            } else {
              botReplyContent = 'Error al interpretar la respuesta del LLM.';
            }
          }

          // Agregar la respuesta del asistente al array de mensajes
          this.messages.push({ role: 'assistant', content: botReplyContent });
           //NEW SCROLL - Desplazar scroll al final tras agregar el mensaje del asistente
           this.scrollToBottom();
        },
        (error) => {
          console.error('Error enviando mensaje al LLM', error);
          this.messages.push({
            role: 'assistant',
            content: 'Error al comunicarse con el LLM.',
          });
        }
      );
    } catch (error) {
      console.error('Error obteniendo la ubicación:', error);
      this.messages.push({
        role: 'assistant',
        content:
          'No se pudo obtener la ubicación. Asegúrate de haber otorgado los permisos necesarios.',
      });
    }
  }



  ngOnInit() {

     //NEW CHAT STORE
    this.chatStorageService.loadMessages().then((savedMessages: ChatMessage[]) => {
      if (savedMessages.length > 0) {
        this.messages = savedMessages;
      }
    });
     //NEW CHAT STORE 
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
        if (isLoggedIn) {
          this.showConnectionMessage('Te has conectado.', true);
        } else {
          this.showConnectionMessage('Has iniciado como invitado.', false);
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Enviar el mensaje al bot y obtener su respuesta
  sendMessage() {
    if (this.userMessage.trim().length > 0) {

     // Agregar el mensaje del usuario y guardar el historial
    this.messages.push({ role: 'user', content: this.userMessage });
    this.chatStorageService.saveMessages(this.messages); //NEW CHAT STORE

    this.scrollToBottom();

      // Enviar el array completo de mensajes al LLM
      this.chatService.sendMessageToLLM(this.messages).subscribe(
        (response) => {
          // Manejar la respuesta dependiendo del entorno
          let botReplyContent: string;

          if (this.platform.is('hybrid')) {
            //entorno nativo
            // En dispositivos, la respuesta está en response.data
            const responseData = response.data;
            console.log('Respuesta del LLM:', responseData);
            if (
              responseData &&
              responseData.choices &&
              responseData.choices.length > 0
            ) {
              botReplyContent = responseData.choices[0].message.content;
            } else {
              botReplyContent = 'Error al interpretar la respuesta del LLM.';
            }
          } else {
            // En el navegador, la respuesta está directamente en response
            console.log('Respuesta del LLM:', response);
            if (response && response.choices && response.choices.length > 0) {
              botReplyContent = response.choices[0].message.content;
            } else {
              botReplyContent = 'Error al interpretar la respuesta del LLM.';
            }
          }

          // Agregar la respuesta del asistente al array de mensajes
          this.messages.push({ role: 'assistant', content: botReplyContent });

          this.scrollToBottom();

        },
        (error) => {
          console.error('Error enviando mensaje al LLM', error);
          this.messages.push({
            role: 'assistant',
            content: 'Error al comunicarse con el LLM.',
        

          });
          this.scrollToBottom();
        }
      );

      this.userMessage = ''; // Limpiar el input después de enviar
       //NEW SCROLL - Desplazar scroll al final tras enviar el mensaje
       this.scrollToBottom();
    }
  }


  // Método para enviar las tareas almacenadas al LLM
  async sendTasksToLLM() {
    try {
      const tasks = await this.taskService.getAllTasks();

      if (tasks.length === 0) {
        this.messages.push({
          role: 'assistant',
          content: 'No hay tareas guardadas.',
        });
        return;
      }

      // Crear un mensaje único y formateado con todas las tareas excluyendo 'imageUrl'
      let tasksMessage = 'Estas son tus tareas:\n';
      tasks.forEach((task, index) => {
        tasksMessage += `**Tarea ${index + 1}**: ${task.title} - ${
          task.content
        }\n`;
      });

      tasksMessage +=
        '\nPor favor, devuélveme las tareas en un mensaje claramente organizado, formato **Tarea 1**: Título - Descripción, **Tarea 2**: Título - Descripción, etc.';

      // Mostrar "Enviando tareas..." al usuario
      this.messages.push({ role: 'user', content: 'Enviando tareas...' });

      //NEW CHAT STORE
      this.chatStorageService.saveMessages(this.messages);
      //NEW CHAT STORE

      // Enviar el mensaje formateado de tareas al LLM
      const formattedMessages = [{ role: 'user', content: tasksMessage }];

      this.chatService
        .sendMessageToLLM([...this.messages, ...formattedMessages])
        .subscribe(
          (response) => {
            let botReplyContent: string;

            if (this.platform.is('hybrid')) {
              // Entorno nativo
              const responseData = response.data;
              if (
                responseData &&
                responseData.choices &&
                responseData.choices.length > 0
              ) {
                botReplyContent = responseData.choices[0].message.content;
              } else {
                botReplyContent = 'Error al interpretar la respuesta del LLM.';
              }
            } else {
              if (response && response.choices && response.choices.length > 0) {
                botReplyContent = response.choices[0].message.content;
              } else {
                botReplyContent = 'Error al interpretar la respuesta del LLM.';
              }
            }

            // Agregar la respuesta del asistente al array de mensajes
            this.messages.push({ role: 'assistant', content: botReplyContent });
          },
          (error) => {
            console.error('Error enviando tareas al LLM', error);
            this.messages.push({
              role: 'assistant',
              content: 'Error al enviar las tareas al LLM.',
            });
          }
        );
    } catch (error) {
      console.error('Error obteniendo las tareas', error);
      this.messages.push({
        role: 'assistant',
        content: 'Error al obtener las tareas.',
      });
    }
  }

  adjuntarArchivo() {
    alert('Adjuntar archivo');
    // Implementación futura para adjuntar archivos
  }

  sendAudio() {
    alert('Enviar audio');
    // Implementación futura para enviar audio
  }

  // Método para mostrar el mensaje de conexión
  private showConnectionMessage(message: string, isUser: boolean) {
    this.message = message;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false; // Oculta el mensaje después de 3 segundos
    }, 3000);
  }
  
  //NEW CHAT STORE 
  clearChat(): void {
    this.messages = [{ role: 'assistant', content: 'Hola, ¿En qué puedo ayudarte?' }];
    this.chatStorageService.clearMessages();
  }
  //NEW CHAT STORE 


}




/* 
* ./: Directorio actual (mismo nivel).
  ../: Sube un nivel en el árbol de directorios.
  Sin extensión .ts: TypeScript sabe automáticamente que está buscando un archivo .ts sin que se necesite especificar la extensión.


* messages: 
Un array que contiene los mensajes del chat, tanto del asistente, como del usuario.
Cada mensaje es un objeto con dos propiedades:

  messages = [{ 
              role: 'user' o 'assistant'
              content: 'El contenido varia en cada chat, pero hace referencia a el usuario o la respuesta del asistente' }];

De esta forma se controla que contenido le corresponde a que rol.


*OnInit y OnDestroy 
se utilizan para ejecutar lógica en momentos específicos del ciclo de vida de un componente. 
La interfaz OnInit define el método ngOnInit(), que es invocado por Angular justo después de que el componente ha sido inicializado.
La interfaz OnDestroy define el método ngOnDestroy(), que es invocado por Angular justo antes de que el componente sea destruido o eliminado.


*Los tres puntos ... Operador de propagación (spread operator)
Son parte de JavaScript (ES6). El operador ... toma elementos todos los elementos de un array y permite combinarlos en otro.

*\n 
salto de linea





*/
