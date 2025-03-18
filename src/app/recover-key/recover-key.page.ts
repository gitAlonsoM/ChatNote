import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Asegúrate de que la ruta sea correcta
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-recover-key',
  templateUrl: './recover-key.page.html',
  styleUrls: ['./recover-key.page.scss'],
})
export class RecoverKeyPage {
  email: string = '';  // Variable para almacenar el correo electrónico ingresado

  constructor(
    private router: Router,
    private authService: AuthService, // Servicio de autenticación
    private toastController: ToastController // Para mostrar mensajes de toast
  ) {}

  // Función para enviar el correo de recuperación de contraseña
  async sendRecoveryEmail() {
    // Validamos que el correo sea correcto usando la función isValidEmail
    if (!this.isValidEmail(this.email)) {
      this.presentToast('Por favor, ingrese un correo electrónico válido.');
      return;
    }

    try {
      // Llamamos al servicio para enviar el correo de recuperación de contraseña
      await this.authService.resetPassword(this.email); // Usamos el método del AuthService para enviar el correo
      this.presentToast('El enlace de recuperación ha sido enviado a su correo electrónico. Por favor, revise su bandeja de entrada.');
    } catch (error) {
      // Si hay un error, mostramos el mensaje correspondiente
      this.presentToast('Error al enviar el correo de recuperación. Asegúrese de que el correo sea correcto.');
    }
  }

  // Función para validar el formato del correo electrónico
  isValidEmail(email: string): boolean {
    // Usamos una expresión regular para validar el formato del correo
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }

  // Redirigir al login en caso de que el usuario quiera volver a la página de inicio de sesión
  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Función para mostrar mensajes de toast (mensajes emergentes)
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,  // Duración del mensaje
      position: 'top',  // Posición en la que aparecerá el mensaje
      color: 'success', // Color del toast (puedes cambiarlo a 'danger' para errores)
    });
    toast.present();
  }
}