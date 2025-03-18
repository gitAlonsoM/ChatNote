import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecoverKeyPageRoutingModule } from './recover-key-routing.module';

import { RecoverKeyPage } from './recover-key.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecoverKeyPageRoutingModule
  ],
  declarations: [RecoverKeyPage]
})
export class RecoverKeyPageModule {}
