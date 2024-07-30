# Contribuir a los proyectos de proyectosingenieriauninorte

¿Quieres ayudar en los proyectos de proyectosingenieriauninorte? ¡Genial! Siéntete bienvenido y lee las siguientes secciones para saber cómo hacer preguntas y cómo trabajar en algo.

Seguir estas pautas ayuda a comunicar que respetas el tiempo de los desarrolladores que gestionan y desarrollan este proyecto de código abierto. A cambio, ellos deberían corresponder ese respeto abordando tu problema, evaluando los cambios y ayudándote a finalizar tus pull requests.

Hay muchas formas de contribuir, desde mejorar la documentación, enviar informes de errores y solicitudes de funcionalidades hasta escribir código que pueda incorporarse a los proyectos de proyectosingenieriauninorte.

## Cómo reportar un bug

Estamos usando GitHub Issues para nuestros bugs públicos. Mantenemos un ojo cercano en esto e intentamos dejar claro cuando tenemos una solución interna en progreso. Antes de presentar una nueva tarea, intenta asegurarte de que tu problema no existe ya.

Aquí hay algunas notas sobre cómo reportar el bug para que podamos solucionarlo lo más rápido posible:

* Explica, con el mayor detalle posible, cómo reproducir el problema.
* Incluye lo que esperabas que sucediera, así como lo que realmente sucedió.
* Si es un error con el sitio web, por favor incluye información sobre la versión del navegador y el sistema operativo que estás utilizando.
* Si ayuda, siéntete libre de adjuntar una captura de pantalla o video que ilustre el problema.
* Si tienes problemas con una build específica, por favor incluye un enlace a la build o job en cuestión.

## Cómo sugerir una funcionalidad o mejora

Las contribuciones son bienvenidas a través de pull requests en GitHub. Cada pull request debe implementar UNA característica o corrección de errores.
Si quieres añadir o arreglar más de una cosa, envía más de una pull request.

El equipo central está monitoreando las pull requests. Revisaremos tu pull request y la fusionaremos, solicitaremos cambios o la cerraremos con una explicación.

Antes de enviar una pull request, por favor asegúrate de que se haya hecho lo siguiente:

* Haz un fork del repositorio y crea tu rama desde master.
* Si has solucionado un bug o añadido código que debería ser probado, ¡añade pruebas!
* Asegúrate de que el conjunto de pruebas pase.
* Formatea tu código con el estilo de código correspondiente al proyecto.
* Asegúrate de que tu código pase el linter.

## Tu Primer Pull Request

Este proyecto tiene como objetivo simplificar y guiar a los principiantes en su primera contribución. Si estás buscando hacer tu primera contribución, sigue los pasos a continuación.

_Si no te sientes cómodo con la línea de comandos, [aquí tienes tutoriales usando herramientas GUI.](#tutorials-using-other-tools)_

<img align="right" width="300" src="https://firstcontributions.github.io/assets/Readme/fork.png" alt="fork this repository" />

#### Si no tienes git en tu máquina, [instálalo](https://docs.github.com/en/get-started/quickstart/set-up-git).

## Haz un fork de este repositorio

Haz un fork de este repositorio haciendo clic en el botón de fork en la parte superior de esta página.
Esto creará una copia de este repositorio en tu cuenta.

## Clona el repositorio

<img align="right" width="300" src="https://firstcontributions.github.io/assets/Readme/clone.png" alt="clone this repository" />

Ahora clona el repositorio forked en tu máquina. Ve a tu cuenta de GitHub, abre el repositorio forked, haz clic en el botón de código y luego en el ícono de _copiar al portapapeles_.

Abre una terminal y ejecuta el siguiente comando git:

```bash
git clone "url que acabas de copiar"
```

donde "url que acabas de copiar" (sin las comillas) es la URL de este repositorio (tu fork de este proyecto). Consulta los pasos anteriores para obtener la URL.

<img align="right" width="300" src="https://firstcontributions.github.io/assets/Readme/copy-to-clipboard.png" alt="copy URL to clipboard" />

Por ejemplo:

```bash
git clone git@github.com:este-es-tu-usuario/first-contributions.git
```

donde `este-es-tu-usuario` es tu nombre de usuario de GitHub. Aquí estás copiando el contenido del repositorio first-contributions en GitHub a tu computadora.

## Crea una rama

Cambia al directorio del repositorio en tu computadora (si no estás ya allí):

```bash
cd first-contributions
```

Ahora crea una rama usando el comando `git switch`:

```bash
git switch -c nombre-de-tu-nueva-rama
```

Por ejemplo:

```bash
git switch -c agregar-alonzo-church
```

## Realiza los cambios necesarios y confirma esos cambios

Ahora abre el archivo `Contributors.md` en un editor de texto, agrega tu nombre. No lo pongas al principio ni al final del archivo. Colócalo en cualquier parte del medio. Ahora, guarda el archivo.

<img align="right" width="450" src="https://firstcontributions.github.io/assets/Readme/git-status.png" alt="git status" />

Si vas al directorio del proyecto y ejecutas el comando `git status`, verás que hay cambios.

Añade esos cambios a la rama que acabas de crear usando el comando `git add`:

```bash
git add Contributors.md
```

Ahora confirma esos cambios usando el comando `git commit`:

```bash
git commit -m "Agregar tu-nombre a la lista de Contribuyentes"
```

reemplazando `tu-nombre` con tu nombre.

## Envía los cambios a GitHub

Envía tus cambios usando el comando `git push`:

```bash
git push -u origin nombre-de-tu-rama
```

reemplazando `nombre-de-tu-rama` con el nombre de la rama que creaste anteriormente.

<details>
<summary> <strong>Si obtienes errores al enviar, haz clic aquí:</strong> </summary>

- ### Error de Autenticación
     <pre>remote: Support for password authentication was removed on August 13, 2021. Please use a personal access token instead.
  remote: Please see https://github.blog/2020-12-15-token-authentication-requirements-for-git-operations/ for more information.
  fatal: Authentication failed for 'https://github.com/<tu-usuario>/first-contributions.git/'</pre>
  Ve al [tutorial de GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account) sobre cómo generar y configurar una clave SSH para tu cuenta.

</details>

## Envía tus cambios para revisión

Si vas a tu repositorio en GitHub, verás un botón de `Comparar & pull request`. Haz clic en ese botón.

<img style="float: right;" src="https://firstcontributions.github.io/assets/Readme/compare-and-pull.png" alt="create a pull request" />

Ahora envía la solicitud de extracción.

<img style="float: right;" src="https://firstcontributions.github.io/assets/Readme/submit-pull-request.png" alt="submit pull request" />

Pronto estaré fusionando todos tus cambios en la rama principal de este proyecto. Recibirás un correo electrónico de notificación una vez que los cambios se hayan fusionado.

## ¿Dónde ir desde aquí?

¡Felicidades! ¡Acabas de completar el flujo de trabajo estándar _fork -> clone -> edit -> pull request_ que a menudo encontrarás como contribuyente!