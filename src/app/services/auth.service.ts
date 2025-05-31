// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import {Auth,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail, signOut, User, UserCredential} from '@angular/fire/auth';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(false); // Inicializa en false
  isLoggedIn$ = this.isLoggedInSubject.asObservable(); // Observable para que otros componentes puedan suscribirse

  private currentUserSubject = new BehaviorSubject<User | null>(null); // Mantener para currentUser si se usa
  public currentUser$ = this.currentUserSubject.asObservable();

  private authStateChecked = new ReplaySubject<void>(1);
  public authStateChecked$ = this.authStateChecked.asObservable(); // Observable para que el guard lo use
  private initialCheckDone: boolean = false; // Flag para asegurar que authStateChecked.next() solo se llame una vez


  private auth: Auth = inject(Auth);

  constructor(
    private router: Router,
    private toastController: ToastController,
    private http: HttpClient
  ) {

      // Se dispara cada vez que Firebase detecta cambio de auth-state
    this.auth.onAuthStateChanged(user => {
      console.log('DEBUG: [AuthService] onAuthStateChanged. User:', user ? user.uid : 'null'); // DEBUG
      this.currentUserSubject.next(user); // Actualizar currentUser
      this.isLoggedInSubject.next(!!user); // Actualizar estado de login

      // Indicar que la comprobación inicial del estado de autenticación ha terminado, solo la primera vez
      if (!this.initialCheckDone) {
        console.log('DEBUG: [AuthService] Initial auth state checked.'); // DEBUG
        this.authStateChecked.next(); // Emitir una vez que onAuthStateChanged se haya ejecutado por primera vez
        this.authStateChecked.complete(); // Completar el ReplaySubject, ya no necesitamos más emisiones de él
        this.initialCheckDone = true;
      }
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
    this.http.post('http://127.0.0.1:8000/api/register/', payload).subscribe({
      next: response => {
        console.log('Datos enviados a Django:', response);
      },
      error: error => {
        console.error('Error al enviar a Django:', error);
      }
    });
  }

  // Método para iniciar sesión
    async login(email: string, password: string, rememberMe = false): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Inicio de sesión exitoso:', userCredential);          // DEBUG
      this.isLoggedInSubject.next(true);

      // NEW: asegura creación/validación del usuario en Oracle
      const { uid, email: e } = userCredential.user;
      
      
// El nombre 'Provisorio' solo debe enviarse si 'name' no está disponible o es un nuevo login sin ese dato
      // Esto podría ser mejorado para tomar el nombre del perfil de Firebase si existe
      this.sendToDjango(uid, e ?? '', 'Usuario Logueado'); // Ajustado el nombre enviado

      if (rememberMe) {
        // Considerar usar localStorage para persistencia más allá de la sesión si "rememberMe" es verdadero.
        // Firebase maneja su propia persistencia, sessionStorage aquí es para tu lógica de app.
        sessionStorage.setItem('user', JSON.stringify(userCredential.user));
      }
      return userCredential.user;
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      throw error;
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
  async getCurrentUser(): Promise<User | null> {
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

        sessionStorage.removeItem('user'); // Esto está bien

        // Mostrar toast de desconexión exitosa
        this.showToast('Te has desconectado de forma exitosa. Vuelve pronto.');
        // Navegar al login DESPUÉS de que el estado se haya actualizado y el toast se muestre
        // Es mejor que la navegación la maneje el guard o AppComponent basado en isLoggedIn$
        // pero si quieres forzarla aquí, asegúrate que sea lo último.
        this.router.navigate(['/login'], { replaceUrl: true }); // Añadir redirección aquí si es necesario

      } catch (error) {
        console.error('Error al desconectarse:', error);
        throw error; // Propaga el error para manejo en el componente
      }
    } else {
      // Si no hay un usuario autenticado (invitado), no se realiza el cierre de sesión
      console.log('Usuario invitado no necesita desconectarse.');
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
    await toast.present();
  }

  // Método público para obtener el valor actual de isLoggedIn
  getIsLoggedIn(): boolean {
    return this.isLoggedInSubject.getValue();
  }
}

