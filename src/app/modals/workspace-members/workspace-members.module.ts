//src\app\modals\workspace-members\workspace-members.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WorkspaceMembersPageRoutingModule } from './workspace-members-routing.module';
import { WorkspaceMembersPage } from './workspace-members.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkspaceMembersPageRoutingModule
  ],
  declarations: [WorkspaceMembersPage]
})
export class WorkspaceMembersPageModule {}