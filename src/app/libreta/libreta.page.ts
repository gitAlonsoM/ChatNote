// src/app/libreta/libreta.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { AlertController, ToastController, Platform } from '@ionic/angular';
import { AuthService } from '../services/auth.service'; // Importar AuthService
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; // Importar funciones de la camara con capacitor


// Definir la interface para el tipo de datos de las tareas creadas
interface Task {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null; // Url de la img es opcional
}

@Component({
  selector: 'app-libreta',
  templateUrl: './libreta.page.html',
  styleUrls: ['./libreta.page.scss'],
})

export class LibretaPage implements OnInit {
  tasks: Task[] = []; // Array de objetos para almacenar las tareas
  isLoggedIn: boolean = false; 
  showMessage: boolean = false;
  message: string = '';

  constructor(
    private taskService: TaskService,
    private alertCtrl: AlertController,
    private router: Router,
    private authService: AuthService, // Se inyecta AuthService
    private toastController: ToastController,
    private platform: Platform // Detecta si está en móvil o web

  ) {}


  ngOnInit() { // Metodo que se ejecuta al iniciar el componente
    this.loadTasks();
    this.authService.isLoggedIn$.subscribe((isLoggedIn: boolean) => {
      this.isLoggedIn = isLoggedIn;
    });
  }


  //*Cargar todas las tareas almacenadas
  async loadTasks() {
    try {
      this.tasks = await this.taskService.getAllTasks(); //se obtienen las tareas desde el almacenamiento
    } catch (error) {
      this.showToast('Error al cargar las tareas.');
    }
  }


  // Método para capturar una imagen o seleccionar desde la galería
  async addImage(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90, //Calidad de la img [0-100]
        allowEditing: false, // Sin edición.
        resultType: CameraResultType.DataUrl, // Retorna la imagen en formato base64.
        source: CameraSource.Prompt, // Permite elegir entre cámara y galería
      });
      return image?.dataUrl || null; // Devuelve la imagen en base64 o null si no se seleccionó ninguna.
    } catch (error) {
      console.error('Error obteniendo la imagen', error);
      this.showToast('Imagen no seleccionada.');
      return null;
    }
  }


  //*Crear o editar una tarea, permite adjuntar imagen
  async newTask(taskId: string | null = null) {
    try {
      let imageUrl: string | null = null;

      if (taskId) {
        // Si estamos editando, obtenemos la tarea actual para usar su imagen
        const existingTask = this.tasks.find(task => task.id === taskId);
        if (existingTask) {
          imageUrl = existingTask.imageUrl ?? null; // Asegura que sea 'string' o 'null', Mantiene la imagen original al modificar la tarea

        }
      } else if (this.platform.is('hybrid')) {
        // Solo ofrecer la opción de imagen en dispositivos móviles
        imageUrl = await this.addImage();
        console.log('Imagen seleccionada:', imageUrl);
      }
       
      const alert = await this.alertCtrl.create({
        header: taskId ? 'Editar tarea' : 'Nueva tarea', // Define el titulo del formulario (dependiendo si es una nueva tarea o se esta editando una existente)
        inputs: [
          {
            name: 'title',
            type: 'text',
            placeholder: 'Título', 
          },
          {
            name: 'content',
            type: 'textarea',
            placeholder: 'Contenido',
          },
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: taskId ? 'Actualizar' : 'Guardar',
            handler: async (data) => {
              console.log('Datos del formulario:', data); // Imprimir los datos del formulario
              if (!data.title || !data.content) { //en caso que alguno sea "false(vacio)" se invierte a "true" con !(operador de negacion(invierte el booleano)), y entra en la condicion if()
                this.showToast('El título y el contenido son obligatorios.');
                return;
              }
              const id = taskId ? taskId : new Date().getTime().toString();
              const task: Task = {
                id,
                title: data.title,
                content: data.content,
                imageUrl: imageUrl || null, // Usa la imagen existente o nueva si está disponible
              };
              try {
                console.log('Guardando tarea:', task); // Imprimir la tarea que se va a guardar
                await this.taskService.saveTask(id, task);
                this.loadTasks();
              } catch (error) {
                console.error('Error guardando la tarea', error);
                this.showToast('Error al guardar la tarea.');
              }
            },
          },
        ],
      });
      await alert.present();
    } catch (error) {
      console.error('Error creando o editando tarea', error);
      this.showToast('Error al abrir el formulario de tarea.');
    }
  }


  //*Eliminar tarea
  async deleteTask(taskId: string) {
    try {
      await this.taskService.deleteTask(taskId);
      this.loadTasks();
    } catch (error) {
      console.error('Error eliminando la tarea', error);
      this.showToast('Error al eliminar la tarea.');
    }
  }

  // Editar tarea
  editTask(taskId: string) {
    this.newTask(taskId); // Reutiliza el formulario para editar
  }

  // Método para navegar al chat
  chat() {
    if (this.isLoggedIn) {
      this.router.navigate(['/chat']);
    } else {
      alert('Debe iniciar sesión para acceder al chat.');
    }
  }

  // Método para desconectarse
  async logout() {
    if (this.isLoggedIn) {
      await this.authService.logout();
    }
  }

  // Método para mostrar un mensaje tipo Toast
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000, // Duración en milisegundos
      color: 'danger', // Puedes cambiar el color según tu preferencia
    });
    await toast.present();
  }
}







/* 
* El AlertController (alertCtrl) de Ionic:
es una clase que se utiliza para crear y mostrar alertas en las aplicaciones. 
Las alertas son ventanas emergentes que contienen mensajes y opciones de interacción, como botones para aceptar o cancelar.

* Interface :
en TypeScript es una forma de definir la estructura de un objeto (plantilla). Sirve para especificar qué propiedades y tipos debe tener un objeto.
interface Task; cada tarea creada es un objeto con "id, titulo y contenido", la interface es su plantilla para crearlas, pero no el objeto en si.

* ngOnInit() :
método opcional que puedes definir en tu componente si implementas la interfaz OnInit. Es comúnmente utilizado para cargar datos y realizar inicializaciones importantes.
Puedes colocar otros métodos dentro de ngOnInit() para que se ejecuten al inicializar el componente.

*operador ternario (? :) 
se utiliza para evaluar una expresión y devolver uno de dos valores dependiendo de si la expresión es verdadera o falsa.

*operador || 
(OR lógico) indica si cualquiera de los operandos es verdadero. 

*/   

/*
* El método "onLibretaButtonClick()":
- Comprueba si el usuario está conectado.
- Si no lo está, establece un mensaje que indica que debe iniciar sesión y lo muestra durante 3 segundos.

* Para mostrar mensajes emergentes en lugar de una alerta simple:
- Puedes considerar utilizar "ToastController" para mostrar el mensaje de forma más elegante. 
- En el constructor, ya se ha importado "ToastController", lo cual será útil para esto.



*Servicio Platform de Ionic 
Se usa en este caso para determinar si la aplicación se está ejecutando en un entorno híbrido ('hybrid').  
Un entorno híbrido es cuando se esta ejecutando en un mobil como apk o en un emulador. Si se especificara solamente 'mobile' solo seria en "apk" pero no se podria probar en el emulador de android studio. Otros valores pueden ser 'desktop', 'android', 'ios', 



*/ 