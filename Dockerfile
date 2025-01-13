# Fase 1: Construcción
FROM node:22 AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración y dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copiar todo el código fuente al contenedor
COPY . .

# Construir la aplicación Angular
RUN npm run build --prod

# Fase 2: Servidor Nginx para servir la aplicación Angular
FROM nginx:stable-alpine

# Copiar la configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos desde la etapa de build
COPY --from=build /app/dist/front-alertas-medicas/browser /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
ENTRYPOINT ["nginx", "-g", "daemon off;"]