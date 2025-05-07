// src/app/chat/chat.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';
import { AuthService } from '../services/auth.service';
import { ToastController, Platform } from '@ionic/angular'; //Platform se usa para verificar si la app esta ejecutada en un entorno nativo
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
      this.chatService.sendMessageToLLM(this.messages).subscribe(
        (response) => {
          let botReplyContent: string = '';
      
          // Verificar si la respuesta incluye tareas (la API retorna { tasks: [...] } en lugar de choices)
          if (response.tasks) {
            // Formatear las tareas en un mensaje
            botReplyContent = 'Tareas obtenidas:\n';
            response.tasks.forEach((task: any, index: number) => {
              botReplyContent += `Tarea ${index + 1}: ${task.titulo} - ${task.descripcion}\n`;
            });
          } else {
            // Si no se reciben tareas, se procesa la respuesta normal del LLM
            if (this.platform.is('hybrid')) {
              // Entorno nativo
              const responseData = response.data;
              console.log('Respuesta del LLM:', responseData);
              if (responseData && responseData.choices && responseData.choices.length > 0) {
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
          }
      
          // Agregar la respuesta (ya sea las tareas o la respuesta normal) al array de mensajes
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
      this.messages.push({ role: 'user', content: this.userMessage });
      this.chatStorageService.saveMessages(this.messages);
      this.scrollToBottom();
  
      this.chatService.sendMessageToLLM(this.messages).subscribe(
        (response) => {
          let botReplyContent: string = '';
  
          // Si la respuesta contiene tareas, formatearlas y actualizamos el system prompt
          if (response.tasks) {
            botReplyContent = 'Tareas obtenidas:\n';
            response.tasks.forEach((task: any, index: number) => {
              botReplyContent += `Tarea ${index + 1}: ${task.titulo} - ${task.descripcion}\n`;
            });
            // Actualizamos el system prompt para que el LLM "conozca" las tareas
            this.chatService.updateSystemPrompt("Tareas actuales:\n" + botReplyContent);
          } else {
            // Resto de la lógica para respuesta normal del LLM
            if (this.platform.is('hybrid')) {
              const responseData = response.data;
              console.log('Respuesta del LLM:', responseData);
              if (responseData && responseData.choices && responseData.choices.length > 0) {
                botReplyContent = responseData.choices[0].message.content;
              } else {
                botReplyContent = 'Error al interpretar la respuesta del LLM.';
              }
            } else {
              console.log('Respuesta del LLM:', response);
              if (response && response.choices && response.choices.length > 0) {
                botReplyContent = response.choices[0].message.content;
              } else {
                botReplyContent = 'Error al interpretar la respuesta del LLM.';
              }
            }
          }
  
          // Agregamos la respuesta (ya sea las tareas o la respuesta normal) al historial del chat
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
  
      this.userMessage = '';
      this.scrollToBottom();
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


