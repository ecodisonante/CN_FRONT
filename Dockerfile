# Fase 1: Construcción
FROM node:22 AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración y dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copiar todo el código fuente al contenedor
COPY . .

# Construir la aplicación Angular - determinar si es prod
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm run build --configuration=production; \
    else \
      npm run build; \
    fi

# Fase 2: Servidor Nginx para servir la aplicación Angular
FROM nginx:stable-alpine

# Production stage
FROM nginx:alpine

# Copiar la aplicación construida desde la fase anterior
COPY --from=build /app/dist/front-alertas-medicas/browser /usr/share/nginx/html

# Crear directorio SSL en el contenedor
RUN mkdir -p /etc/nginx/ssl

# Escribir certificados desde variables de entorno
RUN echo "$SSL_CERTIFICATE" > /etc/nginx/ssl/nginx-selfsigned.crt && \
    echo "$SSL_PRIVATE_KEY" > /etc/nginx/ssl/nginx-selfsigned.key

# Copiar configuración de Nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Exponer puertos
EXPOSE 80 443

# Comando para iniciar Nginx
ENTRYPOINT ["nginx", "-g", "daemon off;"]