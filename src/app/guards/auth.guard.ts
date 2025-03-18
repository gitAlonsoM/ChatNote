// src/app/guards/auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  async canActivate(): Promise<boolean> {
    const isLoggedIn = this.authService.getIsLoggedIn();
    if (isLoggedIn) {
      return true;
    } else {
      const toast = await this.toastController.create({
        message: 'Debes iniciar sesión para acceder a esta característica.',
        duration: 3000,
        position: 'top',
      });
      await toast.present();
      // Mantener al usuario en la página actual
      return false;
    }
  }
}
