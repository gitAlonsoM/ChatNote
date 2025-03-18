

// src/app/app.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  private authSubscription: Subscription | null = null;

  constructor(
    private platform: Platform,
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
      }
    );
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
     
    });
  }

  // Método para desconectarse
  async logout() {
    try {
      await this.authService.logout();
      const toast = await this.toastController.create({
        message: 'Desconectado exitosamente',
        duration: 2000,
        position: 'top',
      });
      toast.present();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al desconectarse', error);
    }
  }
}
