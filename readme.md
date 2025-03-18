# Aplicación "Libreta + Chat con LLM"
## Descripción
Esta aplicación permite a los usuarios interactuar con un modelo de lenguaje (LLM) a través de un chat y gestionar sus tareas personales.
Ha sido desarrollada utilizando Ionic, Angular y Firebase, soportando funcionalidades en dispositivos móviles y navegadores web.


## Páginas y Componentes principales
1. **Login**: Página de autenticación de usuarios.
2. **Creación de Cuenta**: Formulario para el registro de nuevos usuarios mediante un email único y una contraseña.
3. **Chat**: Interfaz de chat con el LLM.
4. **Libreta**: Página para gestionar tareas con funcionalidades CRUD (Crear, Leer, Actualizar, Eliminar). Incluye soporte para imágenes asociadas a tareas.
5. **Otras Páginas**:
   - Recuperación de contraseña.
   - Información de contacto en "¿Quiénes somos?".


# ======================================================================================

## Estructura del Proyecto
El proyecto sigue una estructura típica de una aplicación Angular con Ionic. A continuación, se detalla la estructura principal del proyecto:
## Estructura del Proyecto

myApp/
│
├── .angular/
├── .vscode/
├── android/ # Proyecto nativo de Android generado por Capacitor
├── node_modules/ # Dependencias instaladas del proyecto
├── src/ # Código fuente del proyecto
│ ├── app/ # Contiene todas las páginas, componentes y servicios de la app
│ │ ├── chat/ # Código de la página de chat y servicios relacionados con LLM
│ │ ├── connection-status/ # Componente que gestiona el estado de conexión
│ │ ├── guards/ # Control de acceso a páginas protegidas
│ │ ├── libreta/ # Página con CRUD implementado para tareas
│ │ ├── login/ # Página de autenticación de usuarios
│ │ ├── quienes-somos/ # Información de contacto de la app
│ │ ├── recover-key/ # Recuperación de contraseñas
│ │ ├── register/ # Registro de nuevos usuarios
│ │ ├── services/ # Servicios:
│ │ │ ├── auth.service.ts # Manejo de autenticación
│ │ │ ├── task.service.ts # CRUD de tareas
│ │ │ ├── geolocation.service.ts # Servicio de geolocalización para obtener ubicación del usuario
│ │ ├── app-routing.module.ts # Configuración de rutas de la aplicación
│ │ ├── app.component.html # Template principal de la app
│ │ ├── app.module.ts # Módulo principal del proyecto
│ │
│ ├── assets/ # Recursos estáticos como imágenes e íconos
│ ├── environments/ # Configuración para producción/desarrollo
│ ├── theme/ # Estilos SCSS globales
│ ├── global.scss # Estilos generales adicionales
│ ├── index.html # Archivo principal HTML del proyecto
│
├── www/ # Archivos web compilados listos para el proyecto nativo
├── angular.json # Configuración del proyecto Angular
├── capacitor.config.ts # Configuración específica de Capacitor
├── ionic.config.json # Configuración de Ionic
├── package.json # Scripts y dependencias del proyecto
├── readme.md # Archivo de documentación actualizado
├── tsconfig.json # Configuración de TypeScript


# ======================================================================================

## Funcionalidades Implementadas
- **Gestión de tareas con CRUD**: Crear, editar y eliminar tareas almacenadas localmente utilizando **Capacitor Preferences** y **from '@ionic/storage-angular** para garantizar la persistencia de los datos, incluso después de cerrar la aplicación.
- **Fotografías en tareas**: Adjuntar imágenes tomadas con la cámara o seleccionadas desde la galería (en dispositivos móviles).
- **Geolocalización**: Enviar la ubicación actual al LLM para obtener el nombre del lugar.
- **Autenticación**: Registro, inicio y recuperación de contraseña con Firebase.
- **Interacción con el LLM**:
  - Envío de tareas acumuladas para retroalimentación.
  - Generación de respuestas contextuales personalizadas.



## Funcionalidades del LLM
La aplicación utiliza un modelo de lenguaje (LLM) de OpenAI para interactuar con los usuarios en un chat. Las funciones implementadas incluyen:
- **Generación de Respuestas**: El LLM crea respuestas contextuales basadas en los mensajes del usuario.
- **Personalización**: Se ha configurado un *prompt customizable*.
- **Envio de tareas**: Se ha activado un boton en el chat para enviarle todas las tareas acumuladas en la libreta, y obtener feedback inmediato del LLM segun las tareas almacenadas.


## Funcionalidades Nativas
- **Cámara y galería**: Integración con la API de cámara de Capacitor. **from '@capacitor/camera'**
- **GPS**: Uso de la API de geolocalización de Capacitor para obtener coordenadas, mediante **from '@capacitor/       geolocation'**



## Futuras Funcionalidades
- **Guardado de tareas con LLM**: El sistema LLM podrá guardar tareas de forma automatizada a petición del usuario, agregándolas a la libreta con un formato y horario predefinidos.
- **Tareas con Horario de Notificación**: Cada tarea podrá tener un horario de notificación asignado, y el celular activará la notificación en el horario acordado.


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

## =========================================================================================

Cuenta
#toccatafugue45@gmail.com
AndreZ1515
