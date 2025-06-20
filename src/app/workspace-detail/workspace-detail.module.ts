//src\app\workspace-detail\workspace-detail.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WorkspaceDetailPageRoutingModule } from './workspace-detail-routing.module';
import { WorkspaceDetailPage } from './workspace-detail.page';
import { CarpetaCreatePageModule } from '../carpeta-create/carpeta-create.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkspaceDetailPageRoutingModule,
    CarpetaCreatePageModule

    // WorkspaceRenamePageModule, // Si el modal se abre desde aquí y es una página
    // WorkspaceDeleteConfirmComponentModule // Si el componente se usa aquí
  ],
  declarations: [WorkspaceDetailPage]
})
export class WorkspaceDetailPageModule {}