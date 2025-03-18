/* src\app\chat\custom-instruction\custom-instruction.page.ts */
//NEW CUSTOM INSTRUCTION - Inicio componente Custom Instruction
import { Component, OnInit } from '@angular/core';
import { CustomInstructionService } from './custom-instruction.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-custom-instruction',
  templateUrl: './custom-instruction.page.html',
  styleUrls: ['./custom-instruction.page.scss'],
})
export class CustomInstructionPage implements OnInit {
  customInstruction: string = ''; // El input inicia vacío

  constructor(
    private customInstructionService: CustomInstructionService,
    private toastController: ToastController,
    private router: Router,
    private chatService: ChatService
  ) { }

  async ngOnInit() {
    // Cargar la instrucción almacenada (si existe y es válida) para mostrarla en el input
    const storedInstruction = await this.customInstructionService.getInstruction();
    if (storedInstruction && storedInstruction.length >= 20 && storedInstruction.length <= 200) {
      this.customInstruction = storedInstruction;
      // Actualiza ChatService para que use el prompt almacenado
      this.chatService.updateSystemPrompt(storedInstruction);
    } else {
      this.customInstruction = ''; // Si no hay instrucción válida, el input permanece vacío
    }
  }

  async setCustomInstruction() {
    // Validar longitud: mínimo 20 y máximo 200 caracteres
    if (this.customInstruction.length < 20 || this.customInstruction.length > 200) {
      const toast = await this.toastController.create({
        message: 'La instrucción debe tener entre 20 y 200 caracteres.',
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
      return;
    }
    await this.customInstructionService.setInstruction(this.customInstruction);
    // Actualiza el systemPrompt de ChatService
    this.chatService.updateSystemPrompt(this.customInstruction);
    console.log('Custom instruction establecida:', this.customInstruction);
    this.router.navigate(['/chat']); // Redirige al Chat
  }

  async restoreDefault() {
    const defaultPrompt = this.chatService.getDefaultPrompt();
    await this.customInstructionService.setInstruction(defaultPrompt);
    // Actualiza el systemPrompt a su valor por defecto en ChatService
    this.chatService.updateSystemPrompt(defaultPrompt);
    console.log('Custom instruction restaurada al valor por defecto');
    // Limpia el input para que quede vacío
    this.customInstruction = '';
    this.router.navigate(['/chat']); // Redirige al Chat
  }
}
//NEW CUSTOM INSTRUCTION - Fin componente Custom Instruction
