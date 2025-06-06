import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkspaceInvitePageRoutingModule } from './workspace-invite-routing.module';

import { WorkspaceInvitePage } from './workspace-invite.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkspaceInvitePageRoutingModule
  ],
  declarations: [WorkspaceInvitePage]
})
export class WorkspaceInvitePageModule {}
