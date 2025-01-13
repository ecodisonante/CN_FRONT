# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto de los archivos
COPY . .

# Construir la aplicación
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar la configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos (ahora desde el directorio browser)
COPY --from=build /app/dist/front-alertas-medicas/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
