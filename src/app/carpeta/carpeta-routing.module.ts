// src/app/carpeta/carpeta-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CarpetaPage } from './carpeta.page';

const routes: Routes = [
  {
    path: '', // La ruta base dentro del módulo (ej. /carpeta/:id ya nos trajo aquí)
    component: CarpetaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarpetaPageRoutingModule {}