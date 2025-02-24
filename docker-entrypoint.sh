#!/bin/sh
set -e

# Reemplazar las variables de entorno en el index.html
if [ -n "$API_URL" ]; then
    echo "Configurando API_URL: $API_URL"
    sed -i "s|/\* @echo API_URL \*/|$API_URL|g" /usr/share/nginx/html/index.html
fi

# Iniciar nginx
exec nginx -g 'daemon off;'



