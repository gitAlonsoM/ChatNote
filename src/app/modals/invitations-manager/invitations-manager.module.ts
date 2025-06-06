import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvitationsManagerPageRoutingModule } from './invitations-manager-routing.module';

import { InvitationsManagerPage } from './invitations-manager.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InvitationsManagerPageRoutingModule
  ],
  declarations: [InvitationsManagerPage]
})
export class InvitationsManagerPageModule {}
