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

   @ViewChild('chatMessages', { static: false }) chatMessages!: ElementRef;

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


  private scrollToBottom(): void {
    setTimeout(() => {
      if(this.chatMessages) {
        this.chatMessages.nativeElement.scrollTop = this.chatMessages.nativeElement.scrollHeight;
      }
    }, 100);
  }
  

async sendLocation() {
  try {
    const { latitude, longitude } = await this.geolocationService.getCurrentPosition();
    const content = `Mis coordenadas son: ${latitude}, ${longitude}. ¿Puedes decirme en qué ciudad y país me encuentro?`;

    // Mensaje de usuario y persistencia
    this.messages.push({ role: 'user', content: 'Enviando ubicación...' });
    this.chatStorageService.saveMessages(this.messages);

    // Envío al LLM
    this.chatService.sendMessageToLLM([{ role: 'user', content }]).subscribe(
      res => {
        // INSERT
        if (res.action === 'INSERT') {
          this.messages.push({ role: 'assistant', content: `✅ Task added: "${res.titulo}"` });

        // READ tasks
        } else if (res.tasks) {
          const list = res.tasks
            .map((t: any, i: number) => `${i+1}. ${t.titulo} - ${t.descripcion}`)
            .join('\n');
          this.messages.push({ role: 'assistant', content: `Tareas:\n${list}` });

        // Conversación normal
        } else {
          const data = this.platform.is('hybrid') ? res.data : res;
          const reply = data.choices?.[0]?.message.content 
                        || 'No pude procesar tu respuesta.';
          this.messages.push({ role: 'assistant', content: reply });
        }

        // Guardar y scrollear
        this.chatStorageService.saveMessages(this.messages);
        this.scrollToBottom();
      },
      err => {
        this.messages.push({ role: 'assistant', content: 'Error comunicándose con el LLM.' });
        this.scrollToBottom();
      }
    );

  } catch {
    this.messages.push({
      role: 'assistant',
      content: 'No se pudo obtener la ubicación. Verifica permisos.'
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
       (response: any) => {
              console.log('DEBUG: response in sendMessage', response);
              if (response.action === 'INSERT') {
                console.log('DEBUG: INSERT action received', response);
                const confirmation = `✅ Note added successfully: "${response.contenido}"`;  // use 'contenido'
                this.messages.push({ role: 'assistant', content: confirmation });
                this.chatStorageService.saveMessages(this.messages);
                this.scrollToBottom();
                this.userMessage = '';
                return;
              }
  
              let botReplyContent: string = '';
  
          // Si la respuesta contiene tareas, formatearlas y actualizamos el system prompt
          if (response.notes) {
            botReplyContent = response.notes
              .map((n: any) => `${n.nota_id}. ${n.contenido}`)  // format "ID. content"
              .join('\n');
            this.messages.push({ role: 'assistant', content: botReplyContent });
            this.chatStorageService.saveMessages(this.messages);
            this.scrollToBottom();
            return;
          }
          // ====
           else {
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
  
  clearChat(): void {
    this.messages = [{ role: 'assistant', content: 'Hola, ¿En qué puedo ayudarte?' }];
    this.chatStorageService.clearMessages();
  }


}


