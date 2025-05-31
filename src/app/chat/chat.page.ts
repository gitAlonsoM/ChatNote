// src/app/chat/chat.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';
import { AuthService } from '../services/auth.service';
import { ToastController, Platform } from '@ionic/angular'; 
import { Subscription } from 'rxjs'; 
import { GeolocationService } from '../services/geolocation.service'; 
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})


export class ChatPage implements OnInit, OnDestroy {

   @ViewChild('chatMessages', { static: false }) chatMessages!: ElementRef;

  userMessage: string = '';
  isLoggedIn: boolean = false;
  message: string = ''; 
  showMessage: boolean = false; 
  private authSubscription: Subscription | null = null; 

  messages: { role: string, content: string }[] = [{ 
    role: 'assistant',
    content: 'Hola, ¿En qué puedo ayudarte?'
  }];

  
 constructor( 
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService,
    private toastController: ToastController,
    private platform: Platform,
    private geolocationService: GeolocationService,
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

     this.messages.push({ role: 'user', content: 'Enviando ubicación...' });
    console.log('DEBUG: [ChatPage] sendLocation - User message added, not saving to storage.'); // DEBUG: Indica que no se guarda

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
        // this.chatStorageService.saveMessages(this.messages); // SE ELIMINA el guardado de mensajes
        console.log('DEBUG: [ChatPage] sendLocation - LLM response added, not saving to storage.'); // DEBUG: Indica que no se guarda
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

    console.log('DEBUG: [ChatPage] ngOnInit - Chat initialized without loading from storage.'); // DEBUG: Indica que no se carga desde storage

    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
        if (this.messages.length > 1 || (this.messages.length === 1 && this.messages[0].content !== 'Hola, ¿En qué puedo ayudarte?')) {
            console.log('DEBUG: [ChatPage] isLoggedIn$ or page focus changed, resetting chat to default.');
            this.clearChatInternal(); // Llama a un método interno para resetear solo en memoria
        }
        if (isLoggedIn) {
          this.showConnectionMessage('Te has conectado.', true);
        } else {
          this.showConnectionMessage('Has iniciado como invitado.', false);
        }
      }
    );
    this.scrollToBottom(); 
  }


  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  sendMessage() {
    if (this.userMessage.trim().length > 0) {
      this.messages.push({ role: 'user', content: this.userMessage });

      console.log('DEBUG: [ChatPage] sendMessage - User message added, not saving to storage.'); // DEBUG: Indica que no se guarda
      this.scrollToBottom();

      this.chatService.sendMessageToLLM(this.messages).subscribe(
       (response: any) => {
              console.log('DEBUG: response in sendMessage', response);


              if (response.action === 'INSERT') {
                console.log('DEBUG: INSERT action received', response);
                const confirmation = `✅ Note added successfully: "${response.contenido}"`;  // use 'contenido'
                this.messages.push({ role: 'assistant', content: confirmation });
                this.scrollToBottom();


                this.userMessage = '';
                return;
              }
  
              let botReplyContent: string = '';
  
          if (response.notes) {
            botReplyContent = response.notes
              .map((n: any) => `${n.nota_id}. ${n.contenido}`)  // format "ID. content"
              .join('\n');
            this.messages.push({ role: 'assistant', content: botReplyContent });
            this.scrollToBottom();
            return;
          }
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
    this.clearChatInternal(); // Llama al nuevo método que solo afecta la memoria
    console.log('DEBUG: [ChatPage] clearChat - User explicitly cleared chat (in-memory only).'); // DEBUG
  }

  private clearChatInternal(): void {
    this.messages = [{ role: 'assistant', content: 'Hola, ¿En qué puedo ayudarte?' }];
    console.log('DEBUG: [ChatPage] clearChatInternal - Chat reset to default state (in-memory only).');
    this.scrollToBottom(); 
  }
}




