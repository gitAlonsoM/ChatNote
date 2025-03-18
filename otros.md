
## =========================================================================================
## Comandos y archivos relacionados con capacitor y uso de Geolocalizacion


**Instalación del Plugin de Geolocalización de Capacitor**
npm install @capacitor/geolocation    
npx cap sync 


**Creación del Servicio**
ionic generate service services/geolocation
src\app\services\geolocation.service.ts


**Integración en el Componente (chat.page.ts)**
// src/app/chat/chat.page.ts
import { GeolocationService } from '../services/geolocation.service'; <!-- Se importa el servicio -->

async sendLocation() {}   <!-- Metodo encargado de obtener las coordenadas del servicio geolocation y enviarsela al LLM -->


**Boton para activar la funcion (chat.page.html)**
<!-- src/app/chat/chat.page.html -->
<ion-button fill="clear" (click)="sendLocation()">


## =========================================================================================
## Comando relacionados con capacitor y uso de la Camara

**Instalación del Plugin de Cámara de Capacitor (Android iOS)**
npm install @capacitor/camera 
npx cap sync 


**Servicio de Tareas (task.service.ts)**
/* src\app\services\task.service.ts */

imageUrl?: string | null;    <!-- En la interface "task" se añade la opcion de imagen como opcional -->


## Codigo para gestionar el uso de la camara
// src/app/libreta/libreta.page.ts

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';   <!--  Importar funciones de la camara con capacitor -->

async addImage(){}   <!--  Método para capturar una imagen o seleccionar desde la galería -->


## En la libreta se muestran las imagenes
<!-- src\app\libreta\libreta.page.html  -->
style="max-width: 100px;" 

## =========================================================================================
## =========================================================================================

## COMANDOS VARIOS
ionic generate page login 
ionic generate page chat 

ionic generate service nombre-del-servicio
ionic generate service chat_ejemplo
ionic generate service services/task

ionic generate component menu

