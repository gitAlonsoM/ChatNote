//src\app\login\login.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],

  animations: [
    /* Animación de entrada */
    trigger('pulseAnimation', [
      state('inactive', style({ transform: 'scale(1)', opacity: 1 })),
      state('active', style({ transform: 'scale(1.9)', opacity: 0.5 })),
      transition('inactive <=> active', [animate('0.3s')]),
    ]),
  ]
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false; 
  loading: boolean = false; 
  animationState: string = 'inactive'; 
  showMessage: boolean = false; 
  message: string | null = null; 
  isConnecting: boolean = false; 
  isGuest: boolean = false; 

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    // Verificar si hay mensaje de desconexión en localStorage
    this.message = localStorage.getItem('logoutMessage'); // Obtener el mensaje
    if (this.message) {
      this.showMessage = true;
      localStorage.removeItem('logoutMessage');
      setTimeout(() => {
        this.showMessage = false;
      }, 3000);
    }

    // Remover mensaje de invitado
    localStorage.removeItem('guestMessage');

  
  }

  // entrar como usuario autenticado
  async login() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);

    // Validación de campos vacíos
    if (!this.email.trim() || !this.password.trim()) {
      this.presentToast('Error: Debes estar autenticado. Por favor, crea una cuenta.', 'danger', '⚠️');
      return;
    }

this.isConnecting = true;
    this.animationState = 'active';
    const loading = await this.loadingController.create({
      message: 'Cargando...',
    });
    await loading.present();

    try {
      const user = await this.authService.login(this.email, this.password);
   

      this.presentToast('Entrando como usuario autenticado...', 'success', '✅');
      if (this.rememberMe) {
        localStorage.setItem('user', JSON.stringify(user)); // user podría ser null si el servicio lo permite, mejor usar userCredential.user del servicio
      }

      await this.router.navigate(['/chat']);
      // Si la navegación fue exitosa y no hubo error antes:
      this.animationState = 'inactive'; // Detener animación en éxito
      this.isConnecting = false;       // Resetear estado en éxito
      // loading.dismiss() se hará en finally

    } catch (error) {
      // handleError se encarga de mostrar el toast y resetear this.isConnecting y this.animationState
      this.handleError(error);
    } finally {
      console.log('DEBUG: [LoginPage] Login process finished, entering finally block.'); // DEBUG
      if (loading) { // Asegurar que loading fue creado
        await loading.dismiss();
        console.log('DEBUG: [LoginPage] Loading dismissed in finally.'); // DEBUG
      }
    }
  }


  private async presentToast(message: string, color: string = 'dark', icon: string = '') {
    const toast = await this.toastController.create({
      message: `${icon} ${message}`,
      duration: 2000,
      position: 'top',
      color: color,
    });
    await toast.present();
  }

  private handleError(error: any) {
    const errorCode = (error as any).code;
    let errorMessage = '';

    switch (errorCode) {
       case 'auth/user-not-found':
      case 'auth/invalid-email': // Combinar casos si el mensaje es similar
        errorMessage = 'Error: Usuario no encontrado o email inválido.';
        break;
      case 'auth/wrong-password':
      case 'auth/invalid-credential': // auth/invalid-credential es el que viste en los logs
        errorMessage = 'Error: Credenciales incorrectas. Por favor, verifica tu email y contraseña.';
        break;
      // case 'auth/invalid-email': // Ya cubierto arriba
      //   errorMessage = 'Error: El correo electrónico ingresado no es válido.';
      //   break;
      default:
        errorMessage = 'Error: No se pudo iniciar sesión. Inténtalo de nuevo.';
        console.error('DEBUG: [LoginPage] Unhandled login error code:', errorCode, error); // DEBUG: Para errores no manejados explícitamente
    }

    console.error('Error en el inicio de sesión:', error); // Esto ya lo tenías
    this.presentToast(errorMessage, 'danger', '⚠️');
    this.isConnecting = false; // Asegurar que se resetea el estado de conexión
    this.animationState = 'inactive'; // Asegurar que se resetea el estado de la animación
  }


  createAcc() {
    this.router.navigate(['/register']);
  }

  forgottenPassword() {
    this.router.navigate(['/recover-key']);
  }
}
