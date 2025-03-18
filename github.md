_____________________________________________________________
*CONFIGURAR IDENTIDAD 
Utilizar cada vez que se use una nueva PC
1° git config --global user.name "Nombre de Usuario"
2° git config --global user.email "correo@example.com"



____________________________________________________________
*GUARDAR CAMBIOS
1° git add .
2° git commit -m "cambios realizados..."
3° git push origin nombre_branch  (nombre_branch: Nombre del branch actual que se esta guardando)
              Ejemplo: git push origin main  
  


_____________________________________________________________
*ACTUALIZAR PROYECTO
1° Estar en el branch que se desea actualizar.

Hacer git pull del nombre del branch que se desea traer hacia el branch actual.
Ejemplo: Se esta actualmente en el branch A y se desea actualizar el branch A con los datos del branch B. 
Estando en el branch A se usara : git pull origin B
Si se quiere actualizar el branch A con los datos más actuales de ese mismo branch entonces, estando en el branch A: git pull origin A

2° git pull origin nombre_branch  / Ejemplo:  git pull origin main


______________________________________________________________
*CLONAR PROYECTO
git clone URL_DEL_REPOSITORIO ..


__________________________________________________________
*BRANCH

*Listar branches disponibles
git branch -a  (locales y remotas)
git branch     (solo locales)


*CREAR BRANCH - CAMBIARSE
git branch nombre_branch   (crearla)
git checkout nombre_branch   (cambiarse)
git push -u origin nombre_branch (publicar branch al repositorio remoto (solo la primera vez que es creada))



*Cambiarse de branch
git checkout nombre_branch   (cambiarse a otra branch. Guardar cambios antes en la branch actual, o tira error) 


*CREAR Y CAMBIARSE A UNA NUEVA BRANCH EN UN SOLO COMANDO
git checkout -b nombre_branch


*Actualiza branch con datos de otro branch
1.- Conectarse al branch que requiere los datos
Luego desde el branch que necesita los datos usar el siguien comando, con el nombre del branch que posee los datos requeridos
git merge nombre_branch
2.- Luego de traer los datos, se deben resolver los conflictos y finalmente guardar el branch actual.
git commit -m "Merch realizado... desde ... a .... etc"


__________________________________________________________
*Verificar que se esta en la carpeta correcta del repositorio del proyecto.
Indica el "fetch": Obtener información y cambios del repositorio remoto. 
          "push": Subir tus cambios locales al repositorio remoto. 
En caso de tirar "fatal", probablemente se esta en la carpeta incorrecta.

git remote -v 


_________________________________________________________________
*OTROS

git pull (sin nada para traer todo)
git checkout nombreRama
git status (Ver estado del proyecto actual antes de guardar)

ASDASDASDASAD
INICIALIZAR UN REPOSITORIO (solo si se está creando un nuevo proyecto)
git init



__________________________________________________
## RANDOM


*Api Open AI: toccatafugue45@gmail.com



## Algunos comandos utiles

**Comandos para Crear Servicios**
ionic generate service nombre-del-servicio
ionic generate service chat_ejemplo

**Comandos para Crear Componentes**
ionic generate component menu

**Comandos para Crear Paginas**
ionic generate page login 
ionic generate page chat 


_____________________
APIKEY


