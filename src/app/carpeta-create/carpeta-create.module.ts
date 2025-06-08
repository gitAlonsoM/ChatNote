//src\app\carpeta-create\carpeta-create.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Asegúrate que está aquí
import { IonicModule } from '@ionic/angular';

import { CarpetaCreatePage } from './carpeta-create.page';
// No necesitas routing module si es solo un modal

@NgModule({
  imports: [
    CommonModule,
    FormsModule,    
    IonicModule
  ],
   // 1. Declare the component so this module knows about it.
  declarations: [CarpetaCreatePage],
  // 2. Export the component so other modules that import this one can use it.
  exports: [CarpetaCreatePage]
})
export class CarpetaCreatePageModule {}