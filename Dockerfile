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

# Copiar configuración nginx primero
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Después establecer el workdir y copiar los archivos
# WORKDIR /usr/share/nginx/html
# COPY --from=builder /app/dist/front-alertas-medicas/browser .

# Script de entrada
# COPY docker-entrypoint.sh /
# RUN chmod +x /docker-entrypoint.sh

# Sobreescribir index.html default de nginx
# COPY --from=build /app/dist/front-alertas-medicas/browser/index.csr.html /usr/share/nginx/html/index.html

# Exponer puertos
EXPOSE 80 443

# Comando para iniciar Nginx
ENTRYPOINT ["nginx", "-g", "daemon off;"]