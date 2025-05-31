//src\app\guards\auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'; // SE AÑADEN Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';
import { Observable } from 'rxjs'; // SE AÑADE Observable
import { map, take, tap, switchMap  } from 'rxjs/operators'; // SE AÑADEN map, take, tap


@Injectable({
  providedIn: 'root',
})


export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router // SE AÑADE Router

  ) {}
  

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    console.log('DEBUG: [AuthGuard] canActivate triggered for URL:', state.url);
    return this.authService.authStateChecked$.pipe( 
      switchMap(() => { 
        return this.authService.isLoggedIn$;
      }),
      take(1), // 3. Tomar solo ese valor actual de isLoggedIn$
      map(isLoggedIn => {
        console.log(`DEBUG: [AuthGuard] Final isLoggedIn state after authStateChecked: ${isLoggedIn} for URL: ${state.url}`);
        if (isLoggedIn) {
          console.log('DEBUG: [AuthGuard] Access granted to URL:', state.url);
          return true;
        } else {
          console.log('DEBUG: [AuthGuard] Access denied. Redirecting to /login. Intended URL:', state.url);
          this.showAccessDeniedToast();
          return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
        }
      })
    );
  }


  private async showAccessDeniedToast() { // Método helper para el toast
    const toast = await this.toastController.create({
      message: 'Debes iniciar sesión para acceder a esta página.',
      duration: 3000,
      position: 'top',
      color: 'warning'
    });
    await toast.present();
  }
}