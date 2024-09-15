# syntax=docker/dockerfile:1.4

FROM --platform=$BUILDPLATFORM node:latest as builder

# Crea el directorio de trabajo
RUN mkdir /project
WORKDIR /project

# Instala Angular CLI versión 13
RUN npm install -g @angular/cli@13

# Copia los archivos package.json al contenedor
COPY package.json ./

# Elimina el package-lock.json y node_modules si existen (instalación limpia)
RUN rm -rf node_modules package-lock.json

# Instala las dependencias usando npm install en lugar de npm ci
RUN npm install

# Actualiza la lista de paquetes e instala git
RUN apt-get update && apt-get install -y --no-install-recommends git

# Copia el resto del código
COPY . .

# Expone el puerto 4200 para servir la aplicación Angular
EXPOSE 4200

# Comando para correr la aplicación en modo desarrollo
CMD ["ng", "serve", "--host", "0.0.0.0"]