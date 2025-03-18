import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomInstructionPage } from './custom-instruction.page';

const routes: Routes = [
  {
    path: '',
    component: CustomInstructionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomInstructionPageRoutingModule {}
