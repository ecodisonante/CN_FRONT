# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copiar solo package.json y package-lock.json primero
COPY package*.json ./

# Instalar dependencias con configuraciones optimizadas
RUN npm ci --only=production \
    && npm cache clean --force

# Copiar el resto de los archivos
COPY . .

# Construir la aplicación
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar la configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos
# Ajustamos la ruta según la estructura de salida de Angular
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
