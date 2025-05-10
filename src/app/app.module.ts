/* src\app\app.module.ts */
/*Modulo raiz de la web en donde se realizan las importaciones necesarias para su funcionamiento global  */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';  // ✅ Firestore agregado
import { environment } from '../environments/environment';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage-angular';
import { CarpetaCreatePage } from './carpeta-create/carpeta-create.page'; 

@NgModule({
  declarations: [
    AppComponent,
<<<<<<< HEAD
=======
    CarpetaCreatePage
   
>>>>>>> 72ab990b425813f42bfdd310ea8073d810fab7ce
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),  //Necesario para el almacenamiento local (tasks)
    AppRoutingModule,
    HttpClientModule, //modulo HTTP de Angular para hacer uso de la API
    BrowserAnimationsModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // Inicializa Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    // Inicializa la autenticación de Firebase
    provideAuth(() => getAuth()),
    // ✅ Inicializa Firestore
    provideFirestore(() => getFirestore()),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {}