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
  // Borrado el modulo de libreta
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

    {
    path: 'espacio/:id', // Ruta para la página de detalle del espacio colaborativo
    loadChildren: () => import('./workspace-detail/workspace-detail.module').then( m => m.WorkspaceDetailPageModule),
    canActivate: [AuthGuard] // Proteger también esta ruta
  },


   {
    path: 'carpeta/:id', // :id será el carpeta_id
    loadChildren: () => import('./carpeta/carpeta.module').then( m => m.CarpetaPageModule),
    canActivate: [AuthGuard] // Proteger esta ruta, ya que es contenido del usuario
  },

  {
    path: 'workspace-folder/:workspaceId/:folderId',
    loadChildren: () => import('./workspace-folder/workspace-folder.module').then( m => m.WorkspaceFolderPageModule),
    canActivate: [AuthGuard]
  },


  {
    path: 'workspace-create',
    loadChildren: () => import('./modals/workspace-create/workspace-create.module').then( m => m.WorkspaceCreatePageModule)
  },
  {
    path: 'workspace-detail',
    loadChildren: () => import('./workspace-detail/workspace-detail.module').then( m => m.WorkspaceDetailPageModule)
  },
  {
    path: 'workspace-rename',
    loadChildren: () => import('./modals/workspace-rename/workspace-rename.module').then( m => m.WorkspaceRenamePageModule)
  },
  {
    path: 'workspace-members',
    loadChildren: () => import('./modals/workspace-members/workspace-members.module').then( m => m.WorkspaceMembersPageModule)
  },
  {
    path: 'workspace-invite',
    loadChildren: () => import('./modals/workspace-invite/workspace-invite.module').then( m => m.WorkspaceInvitePageModule)
  },
  {
    path: 'invitations-manager',
    loadChildren: () => import('./modals/invitations-manager/invitations-manager.module').then( m => m.InvitationsManagerPageModule)
  },
  {
    path: 'workspace-folder',
    loadChildren: () => import('./workspace-folder/workspace-folder.module').then( m => m.WorkspaceFolderPageModule)
  },


  



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}