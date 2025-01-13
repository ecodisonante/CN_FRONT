# Build stage
FROM node:18-alpine as builder
WORKDIR /app
# Instalar dependencias
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Construir app
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar configuración nginx primero
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Después establecer el workdir y copiar los archivos
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist/front-alertas-medicas/browser .

# Script de entrada
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Exponer puertos
EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]