//src\app\services\auth.service.ts
import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, User, UserCredential } from '@angular/fire/auth'; 
import { Observable, BehaviorSubject } from 'rxjs'; // Importar BehaviorSubject
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // BehaviorSubject para el estado de inicio de sesión
  private isLoggedInSubject = new BehaviorSubject<boolean>(false); // Inicializa en false
  isLoggedIn$ = this.isLoggedInSubject.asObservable(); // Observable para que otros componentes puedan suscribirse

  // Se asegura de que Auth se inyecte correctamente
  private auth: Auth = inject(Auth); 

  constructor(
    private router: Router,
    private toastController: ToastController,
    private http: HttpClient // Se agrega HttpClient para enviar datos a Django
  ) {
    // Verifica el estado de autenticación al iniciar el servicio
    this.auth.onAuthStateChanged(user => {
      this.isLoggedInSubject.next(!!user);
      // Comentamos o eliminamos la navegación automática al login:
      // if (!user) {
      //   this.router.navigate(['/login']);
      // }
    });
  }

  // Método para registrar un nuevo usuario
  async register(email: string, password: string, name: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('Registro exitoso:', userCredential);
      this.isLoggedInSubject.next(true); // Actualiza el estado a 'true' al registrarse

      // Enviar los datos (uid, email, name) a Django
      const uid = userCredential.user.uid;
      await this.sendToDjango(uid, email, name);

      return userCredential; // Retorna todo el objeto userCredential
    } catch (error) {
      console.error('Error en el registro:', error);
      throw error; // Propaga el error para manejo en el componente
    }
  }

   // Método para enviar los datos a Django (uid, email y name)
   sendToDjango(uid: string, email: string, name: string) {
    const payload = { uid, email, name };

    this.http.post('http://127.0.0.1:8000/api/register/', payload)
      .subscribe({
        next: (response) => {
          console.log('Datos enviados a Django:', response);
        },
        error: (error) => {
          console.error('Error al enviar a Django:', error);
        }
      });
  }
  


  // Método para iniciar sesión
  async login(email: string, password: string, rememberMe: boolean = false): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Inicio de sesión exitoso:', userCredential);
      this.isLoggedInSubject.next(true); // Actualiza el estado a 'true' al iniciar sesión

      // Si "Recordar cuenta" está marcado, guardar el usuario en sessionStorage en lugar de localStorage
      if (rememberMe) {
        sessionStorage.setItem('user', JSON.stringify(userCredential.user)); // Guardar usuario en sessionStorage
      }

      return userCredential.user; // Retorna solo el objeto de usuario
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      throw error; // Propaga el error para manejo en el componente
    }
  }

  // Método para restablecer la contraseña
  async resetPassword(email: string): Promise<void> {
    try {
      // Aquí estamos usando el método de Firebase para enviar el enlace de recuperación
      await sendPasswordResetEmail(this.auth, email);
      console.log('Correo de recuperación enviado a:', email);
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);
      throw error; // Propaga el error para manejarlo en el componente
    }
  }

  // Método para obtener el usuario actual
  getCurrentUser(): User | null {
    return this.auth.currentUser; // Devuelve el usuario actual autenticado
  }

  // Método para obtener el correo del usuario actual
  getCurrentUserEmail(): string {
    const user = this.auth.currentUser; // Se obtiene el usuario actual
    return user?.email ?? 'Invitado'; // Retorna el email o 'Invitado' si no hay usuario autenticado
  }

  // Método para desconectarse
  async logout(): Promise<void> {
    // Solo desconectar si el usuario está autenticado
    if (this.isLoggedInSubject.getValue()) {
      try {
        await signOut(this.auth);
        console.log('Usuario desconectado');
        this.isLoggedInSubject.next(false); // Actualiza el estado a 'false' al desconectarse

        // Limpiar el usuario de sessionStorage
        sessionStorage.removeItem('user');

        // Mostrar toast de desconexión exitosa
        this.showToast('Te has desconectado de forma exitosa. Vuelve pronto.');

        this.router.navigate(['/login']); // Redirigir al login solo si estaba autenticado
      } catch (error) {
        console.error('Error al desconectarse:', error);
        throw error; // Propaga el error para manejo en el componente
      }
    } else {
      // Si no hay un usuario autenticado (invitado), no se realiza el cierre de sesión
      console.log('Usuario invitado no necesita desconectarse.');
      // Mostrar toast de que solo los usuarios autenticados pueden desconectarse
      this.showToast('Solo los usuarios autenticados pueden desconectarse.');
    }
  }

  // Método privado para mostrar mensajes de toast
  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: 'success' // Cambia a 'warning' si quieres un color diferente
    });
    toast.present();
  }

  // Método público para obtener el valor actual de isLoggedIn
  getIsLoggedIn(): boolean {
    return this.isLoggedInSubject.getValue();
  }
}
