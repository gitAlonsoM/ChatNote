// src/app/chat/chat-storage.service.ts
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export interface ChatMessage {
  role: string;
  content: string;
  timestamp?: number; // Opcional: para guardar la fecha/hora del mensaje
}

@Injectable({
  providedIn: 'root'
})
export class ChatStorageService {
  private readonly CHAT_KEY = 'chat_messages';

  constructor(private storage: Storage) {
    this.init();
  }

  async init(): Promise<void> {
    await this.storage.create();
  }

  async saveMessages(messages: ChatMessage[]): Promise<void> {
    return this.storage.set(this.CHAT_KEY, messages);
  }

  async loadMessages(): Promise<ChatMessage[]> {
    const messages = await this.storage.get(this.CHAT_KEY);
    return messages || [];
  }

  async clearMessages(): Promise<void> {
    return this.storage.remove(this.CHAT_KEY);
  }
}
