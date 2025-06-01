
/* src\app\modals\workspace-create\workspace-create.module.ts */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WorkspaceCreatePageRoutingModule } from './workspace-create-routing.module';
import { WorkspaceCreatePage } from './workspace-create.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkspaceCreatePageRoutingModule
  ],
  declarations: [WorkspaceCreatePage]
})
export class WorkspaceCreatePageModule {}