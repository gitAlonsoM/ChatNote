import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomInstructionPageRoutingModule } from './custom-instruction-routing.module';

import { CustomInstructionPage } from './custom-instruction.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomInstructionPageRoutingModule
  ],
  declarations: [CustomInstructionPage]
})
export class CustomInstructionPageModule {}
