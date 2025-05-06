Descripción de la Aplicación “Chat Note”

“Chat Note” es una plataforma híbrida móvil y web diseñada para gestionar, organizar y colaborar sobre notas y archivos de forma inteligente y en tiempo real. Sus principales objetivos son:

Ingreso Conversacional: Permite a usuarios escribir ideas, apuntes y adjuntar documentos directamente desde una interfaz de chat, simulando una conversación fluida.

Clasificación Automática: Utiliza lógica de backend para analizar contenido y asignar cada nota a carpetas temáticas predefinidas o personalizables, reduciendo esfuerzos manuales.

Colaboración en Equipo: Ofrece espacios compartidos donde se pueden invitar colaboradores, participar en chats grupales, asignar notas como tareas, y mantener un historial sincronizado para múltiples dispositivos.

Seguridad y Confiabilidad: Implementa encriptación en tránsito y reposo, cumple normativas de protección de datos, y genera registros de auditoría para administradores.

Notificaciones y Recordatorios: Integra un sistema de alertas y recordatorios configurables para mantener a los usuarios informados de actualizaciones relevantes y plazos importantes.

Tecnologías Principales

Ionic & Firebase (Frontend móvil/web):

Ionic para desarrollar la interfaz híbrida, asegurando responsividad y acceso multiplataforma.

Firebase Authentication y Firestore para login, gestión de usuarios, sesiones y sincronización en tiempo real.

Django (Backend):

Gestiona la lógica de negocio: clasificación automática, control de sesiones, políticas de seguridad y API REST para la comunicación con el cliente.

Oracle SQL (Base de Datos):

Almacena de forma estructurada la información permanente: historias de usuario, logs de auditoría, configuraciones de carpetas y recordatorios.


# ======================================================================================

## Estructura del Proyecto
El proyecto sigue una estructura típica de una aplicación Angular con Ionic. A continuación, se detalla la estructura principal del proyecto:
## Estructura del Proyecto

myApp/
PS ChatNote_IONIC> Show-Tree -Path $root
└── .browserslistrc
└── .editorconfig
└── ALONSO.MD
└── capacitor.config.ts
└── github.md
└── karma.conf.js
└── NewFeaturesAlonso.md
└── otros.md
└── readme.md
├── .angular
│   ├── cache
│   │   ├── 18.2.7
├── src
│   └── global.scss
│   └── index.html
│   └── main.ts
│   └── polyfills.ts
│   └── test.ts
│   └── zone-flags.ts
│   ├── app
│   │   └── app.component.html
│   │   └── app.component.scss
│   │   └── app.component.spec.ts
│   │   └── app.component.ts
│   │   └── app.module.ts
│   │   └── app-routing.module.ts
│   │   ├── chat
│   │   │   └── chat.module.ts
│   │   │   └── chat.page.html
│   │   │   └── chat.page.scss
│   │   │   └── chat.page.spec.ts
│   │   │   └── chat.page.ts
│   │   │   └── chat.service.spec.ts
│   │   │   └── chat.service.ts
│   │   │   └── chat-routing.module.ts
│   │   │   └── chat-storage.service.spec.ts
│   │   │   └── chat-storage.service.ts
│   │   │   ├── custom-instruction
│   │   │   │   └── custom-instruction.module.ts
│   │   │   │   └── custom-instruction.page.html
│   │   │   │   └── custom-instruction.page.scss
│   │   │   │   └── custom-instruction.page.spec.ts
│   │   │   │   └── custom-instruction.page.ts
│   │   │   │   └── custom-instruction.service.spec.ts
│   │   │   │   └── custom-instruction.service.ts
│   │   │   │   └── custom-instruction-routing.module.ts
│   │   ├── connection-status
│   │   │   └── connection-status.component.html
│   │   │   └── connection-status.component.scss
│   │   │   └── connection-status.component.spec.ts
│   │   │   └── connection-status.component.ts
│   │   ├── guards
│   │   │   └── auth.guard.spec.ts
│   │   │   └── auth.guard.ts
│   │   ├── home
│   │   │   └── home.module.ts
│   │   │   └── home.page.html
│   │   │   └── home.page.scss
│   │   │   └── home.page.spec.ts
│   │   │   └── home.page.ts
│   │   │   └── home-routing.module.ts
│   │   ├── login
│   │   │   └── login.module.ts
│   │   │   └── login.page.html
│   │   │   └── login.page.scss
│   │   │   └── login.page.spec.ts
│   │   │   └── login.page.ts
│   │   │   └── login-routing.module.ts
│   │   ├── quienes-somos
│   │   │   └── quienes-somos.module.ts
│   │   │   └── quienes-somos.page.html
│   │   │   └── quienes-somos.page.scss
│   │   │   └── quienes-somos.page.spec.ts
│   │   │   └── quienes-somos.page.ts
│   │   │   └── quienes-somos-routing.module.ts
│   │   ├── recover-key
│   │   │   └── recover-key.module.ts
│   │   │   └── recover-key.page.html
│   │   │   └── recover-key.page.scss
│   │   │   └── recover-key.page.spec.ts
│   │   │   └── recover-key.page.ts
│   │   │   └── recover-key-routing.module.ts
│   │   ├── register
│   │   │   └── register.module.ts
│   │   │   └── register.page.html
│   │   │   └── register.page.scss
│   │   │   └── register.page.spec.ts
│   │   │   └── register.page.ts
│   │   │   └── register-routing.module.ts
│   │   ├── services
│   │   │   └── auth.service.spec.ts
│   │   │   └── auth.service.ts
│   │   │   └── geolocation.service.ts
│   │   │   └── task.service.spec.ts
│   │   │   └── task.service.ts
│   ├── assets
│   │   └── shapes.svg
│   │   ├── icon
│   │   │   └── favicon.png
│   │   ├── images
│   │   │   └── gmail.png
│   │   │   └── instagram.png
│   │   │   └── logo.png
│   │   │   └── Whatsapp.png
│   ├── environments
│   │   └── environment.prod.ts
│   │   └── environment.ts
│   ├── theme
│   │   └── variables.scss
PS C:\Users\alonm\Desktop\ChatNote_IONIC>

# ======================================================================================


# ======================================================================================

## Inicia el Servidor de Desarrollo con Ionic
Para iniciar el servidor de desarrollo y probar la aplicación en un navegador, utiliza el siguiente comando:
ionic serve


## Dependencias Clave
Ionic: Framework para construir aplicaciones móviles y web híbridas.
Angular: Framework para desarrollo de aplicaciones web.
Capacitor: Herramienta para acceder a APIs nativas en aplicaciones móviles.
Ionic Storage: Para la persistencia de datos localmente.
Capacitor Preferences: Utilizado para manejar el almacenamiento clave-valor en Capacitor 6.
SQLite: Base de datos ligera para almacenamiento local en dispositivos móviles.

## Archivos Importantes
angular.json: Configuración del proyecto Angular.
ionic.config.json: Configuración específica de Ionic.
capacitor.config.ts: Configuración de Capacitor para integrar funcionalidades nativas.
src/app: Contiene todos los componentes y páginas de la aplicación.
package.json: Listado de todas las dependencias y scripts del proyecto.

### Módulos y Librerías Clave

- **@angular/common/http**: Facilita las solicitudes HTTP a la API de OpenAI.
- **rxjs**: Permite gestionar de manera reactiva la comunicación asíncrona con la API.


### Versiones usadas en el Proyecto
- **IONIC**: ionic --version "7.2.0"
- **ANGULAR**: ng --version "18.2.3"
--**FIREBASE**: firebase --version "10.14.0"
--**EXPRESS**: express --version "4.21.0"
--**SOCKET.IO**: socket.io --version "4.8.0"
--**TSLIB**: tslib --version "2.3.0"
--**ZONE.JS** zone.js --version "0.14.10"

- **CAPACITOR**:
   @capacitor/core: 6.1.2
   @capacitor/preferences: 1.2.5

## Firebase
   @angular/fire@18.0.1


### Capacitor plugins for android:
       @capacitor-community/http@1.4.1
       @capacitor/app@6.0.1
       @capacitor/camera@6.1.0
       @capacitor/geolocation@6.0.1
       @capacitor/haptics@6.0.1
       @capacitor/keyboard@6.0.2
       @capacitor/preferences@6.0.2
       @capacitor/status-bar@6.0.1


## Instalaciones Más importantes Realizadas
Para soportar las nuevas funcionalidades, se realizaron las siguientes instalaciones, entre otras:

Angular Animations:
npm install @angular/animations

Ionic Storage:
npm install @ionic/storage-angular

Capacitor Preferences:
npm install @capacitor/preferences

Módulo HTTP de Angular: permite hacer solicitudes HTTP (como POST) al servidor de OpenAI.
npm install @angular/common/http


## Posibles errores de inicio y solucion
"Node packages may not be installed. Try installing with 'npm install'."
npm install firebase @angular/fire


## Sincroniza los plugins de Capacitor
Siempre despues de modificar algun plugins de Capacitor sincronizar los cambios antes de usar ionic serve para que se reflejen los cambios.
npx cap sync



## =========================================================================================
### Uso de APIs Nativas mediante Capacitor

## Comando relacionados con capacitor y uso de la Camara
npm install @capacitor/camera   Instala el plugin de la cámara
npx cap sync                    Sincroniza las dependencias de Capacitor con las plataformas nativas.

ionic build      compila la aplicación, generando archivos 
npm run build    compila la aplicación, generando scripts en packege.json


## Comandos y archivos relacionados con capacitor y uso de Geolocalizacion
npm install @capacitor/geolocation
npx cap sync 

src\app\services\geolocation.service.ts  Archivo del servicio de geolocalizacion


## =========================================================================================
### Android Studio
npm install @capacitor/android
npx cap add android     (Estructura compatible con Android en la carpeta android/. Se usa una sola vez. )


## Reconstruir, Sincronizar y emular con android studio
ionic build
npx cap sync android
npx cap open android 
*Medium phone API TyramisuPrivacySandbox -->Run app.

 
## Generacion de APK Sin Firmar (1)
npx cap sync
ionic capacitor build android
npx cap open android
*En Android Studio, selecciona Build > Build APK.
Esto generará la APK sin firmar, y Android Studio te proporcionará la ruta donde se guarda.


## Generacion de APK Sin Firmar (2)
ionic build
npx cap sync android
cd android
.\gradlew.bat assembleDebug

Localiza la APK generada:
android/app/build/outputs/apk/debug/app-debug.apk


## Archivo clave de android studio
AndroidManifest.xml

