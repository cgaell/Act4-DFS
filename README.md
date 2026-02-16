# ACTIVIDAD 4 DESARROLLO FULL STACK
__En que consiste?__
Consiste en una Aplicacion Full Stack hecha con Node.js y con ayuda de un deploy en Vercel, maneja un administrador de inventario, tiene 2 tipos de roles, administrador y viewer (usuario normal).

# REQUISITOS
* Tener sistema operativo Windows o MACOS
* Tener instalado Node.js en tu sistema
* Tener una cuenta de Vercel
* Tener instalado Vercel CLI (Command Line Interface)



## Pasos para su funcionamiento:
# USANDO CLI:
__como la Aplicacion esta trabajada en Vercel, se tienen que realizar los siguientes pasos:__


* 1- Instala Vercel CLI (Command Line Interface)
* 2- Realizar una cuenta de Vercel
``` bash
vercel login
```
* 3- Ejecutar el siguiente comando:
``` bash
cd Act4-DFS\back
```

habiendo ya entrado a la carpeta de "back" en tu terminal, ejecutar:
``` bash
vercel
```
Y despues de eso, entras al link que te proporciona Vercel:
> Servidor corriendo en https://act4-dfs.vercel.app/


# USANDO NAVEGADOR:
* 1- Abre tu navegador y ve a la URL del servidor, en este caso:
``` bash
https://act4-dfs.vercel.app/
```



# Que se observara y como llegar al administrador de productos?
* Primero, estara frente a un formulario de inicio de sesion, abajo habra un enlace que lo envia a un registro de cuenta, que lo redirige a la ruta de registro, terminando el registro regresa al inicio de sesion.
* Despues, al emparejar sus credenciales, ya entrara al administrador de productos.

# Que se puede realizar dentro del administrador?
* Puedes agregar, editar y cambiar el status y cantidad de los productos.
* __Solo el administrador puede eliminar los productos__, __al igual que consultar los proudctos y los usuarios__ dentro de la base de datos.
