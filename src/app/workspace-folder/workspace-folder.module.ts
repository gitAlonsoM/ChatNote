import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkspaceFolderPageRoutingModule } from './workspace-folder-routing.module';

import { WorkspaceFolderPage } from './workspace-folder.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkspaceFolderPageRoutingModule
  ],
  declarations: [WorkspaceFolderPage]
})
export class WorkspaceFolderPageModule {}
