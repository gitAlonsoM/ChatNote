/* src\app\chat\custom-instruction.service.ts */
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class CustomInstructionService {
  private readonly CUSTOM_INSTRUCTION_KEY = 'custom_instruction';

  constructor(private storage: Storage) {
    this.init();
  }

  async init(): Promise<void> {
    await this.storage.create();
  }

  async setInstruction(instruction: string): Promise<void> {
    return this.storage.set(this.CUSTOM_INSTRUCTION_KEY, instruction);
  }

  async getInstruction(): Promise<string | null> {
    return this.storage.get(this.CUSTOM_INSTRUCTION_KEY);
  }

  async clearInstruction(): Promise<void> {
    return this.storage.remove(this.CUSTOM_INSTRUCTION_KEY);
  }
}
