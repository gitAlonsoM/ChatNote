import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LibretaPageRoutingModule } from './libreta-routing.module';

import { LibretaPage } from './libreta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LibretaPageRoutingModule
  ],
  declarations: [LibretaPage]
})
export class LibretaPageModule {}
