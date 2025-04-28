import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Importas tu servicio de autenticación

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
    private authService: AuthService
  ) {}

  async register() {
    // Validaciones de correo y contraseña
    if (!this.isValidEmail(this.email)) {
      alert('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    if (!this.isValidPassword(this.password)) {
      alert('La contraseña debe tener al menos 7 caracteres, incluir al menos una mayúscula y una minúscula.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    try {
      // 1. Registras al usuario en Firebase
      const userCredential = await this.authService.register(this.email, this.password, this.name);

      // 2. Extraes el UID generado por Firebase
      const uid = userCredential.user.uid;

      // 3. Envías los datos a tu backend de Django
      await this.authService.sendToDjango(uid, this.email, this.name);

      alert('Cuenta creada exitosamente.');
      this.router.navigate(['/login']); // Redireccionas al login

    } catch (error) {
      const errorMessage = (error as any).message || 'Error desconocido. Inténtalo de nuevo.';
      alert('Error en el registro: ' + errorMessage);
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
}