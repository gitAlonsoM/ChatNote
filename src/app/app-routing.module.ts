// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard'; // Importa el guardia de autenticación si es necesario

const routes: Routes = [
  // Redirección por defecto a login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Ruta de registro
  { 
    path: 'register',
    loadChildren: () =>
      import('./register/register.module').then((m) => m.RegisterPageModule),
  },

  // Ruta de login
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
  },

  // Ruta de chat
  {
    path: 'chat',
    loadChildren: () =>
      import('./chat/chat.module').then((m) => m.ChatPageModule),
    // Sin AuthGuard para invitados
  },

  // Ruta de libreta (protegida con autenticación)
  {
    path: 'libreta',
    loadChildren: () =>
      import('./libreta/libreta.module').then((m) => m.LibretaPageModule),
    canActivate: [AuthGuard], // Protegida por autenticación
  },

  // Ruta para recuperación de contraseña
  {
    path: 'recover-key',
    loadChildren: () =>
      import('./recover-key/recover-key.module').then(
        (m) => m.RecoverKeyPageModule
      ),
  },

  // Ruta para la página "Quiénes somos"
  {
    path: 'quienes-somos',
    loadChildren: () =>
      import('./quienes-somos/quienes-somos.module').then(
        (m) => m.QuienesSomosPageModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}