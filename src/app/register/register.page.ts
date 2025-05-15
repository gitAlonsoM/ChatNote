// src/app/register/register.page.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';

// IMPORTACIONES DE FIRESTORE
import { getFirestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  name: string = ''; // Nombre del usuario

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  async register() {
    // Validaciones de correo y contraseña
    if (!this.isValidEmail(this.email)) {
      this.showToast('Por favor, ingresa un correo electrónico válido.', 'danger');
      return;
    }

    if (!this.isValidPassword(this.password)) {
      this.showToast('La contraseña debe tener al menos 7 caracteres, incluir al menos una mayúscula y una minúscula.', 'danger');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showToast('Las contraseñas no coinciden.', 'danger');
      return;
    }

    try {
      // 1. Registrar al usuario en Firebase
      const userCredential = await this.authService.register(this.email, this.password, this.name);

      // 2. Extraer el UID generado por Firebase
      const uid = userCredential.user.uid;

      // 3. Enviar los datos al backend de Django
      await this.authService.sendToDjango(uid, this.email, this.name);

      // 4. Guardar log de auditoría en Firestore
      const db = getFirestore();
      await addDoc(collection(db, 'audit_logs'), {
        uid: uid,
        email: this.email,
        name: this.name,
        event: 'register',
        timestamp: new Date()
      });

      // ✅ Cerrar sesión para evitar que lo lleve al chat
      await this.authService.logout();

      // ✅ Mostrar mensaje en /register y redirigir al login tras 2 segundos
      await this.showToast('Cuenta creada exitosamente✅', 'success');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

    } catch (error) {
      const errorMessage = (error as any).message || 'Error desconocido. Inténtalo de nuevo.';
      this.showToast('Error en el registro: ' + errorMessage, 'danger');
    }
  }

  // Validar formato de email
  isValidEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }

  // Validar formato de contraseña
  isValidPassword(password: string): boolean {
    const re = /^(?=.*[a-z])(?=.*[A-Z]).{7,}$/;
    return re.test(password);
  }

  // Ir a la página de login
  goToLogin() {
    this.router.navigate(['/login']);
  }

  // ✅ Método para mostrar mensajes tipo toast
  private async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }
}