FROM node:22.11.0

# Crea el directorio de trabajo
RUN mkdir /project

# Se establece el directorio de trabajo
WORKDIR /project

COPY app/ ./


# Instala Angular CLI versión 13
RUN npm install -g @angular/cli@13

# Instala las dependencias usando npm install en lugar de npm ci
RUN npm install

# Expone el puerto 4200 para servir la aplicación Angular
EXPOSE 4200

# Comando para correr la aplicación en modo desarrollo
CMD ["ng", "serve", "--host", "0.0.0.0"]