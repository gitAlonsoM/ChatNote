import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatPage } from './chat.page';

const routes: Routes = [
  {
    path: '',
    component: ChatPage
  },  {
    path: 'custom-instruction',
    loadChildren: () => import('./custom-instruction/custom-instruction.module').then( m => m.CustomInstructionPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatPageRoutingModule {}
