//src\app\modals\workspace-rename\workspace-rename.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WorkspaceRenamePageRoutingModule } from './workspace-rename-routing.module';
import { WorkspaceRenamePage } from './workspace-rename.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkspaceRenamePageRoutingModule
  ],
  declarations: [WorkspaceRenamePage]
})
export class WorkspaceRenamePageModule {}