import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  email: string = '';    
  password: string = '';
  confirmPassword: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  async register() {
    // Validaciones de entrada
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

    // Intento de registro
    try {
      await this.authService.register(this.email, this.password);
      alert('Cuenta creada exitosamente.');
      this.router.navigate(['/login']);
    } catch (error) {
      const errorMessage = (error as any).message || 'Error desconocido. Inténtalo de nuevo.';
      alert('Error en el registro: ' + errorMessage);
    }
  }

  isValidEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }

  isValidPassword(password: string): boolean { 
    const re = /^(?=.*[a-z])(?=.*[A-Z]).{7,}$/;
    return re.test(password);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}