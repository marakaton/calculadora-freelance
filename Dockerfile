# Usar la imagen oficial de Nginx (servidor web ligero y rápido)
FROM nginx:alpine

# Copiar nuestros archivos HTML/CSS/JS a la carpeta pública del servidor
COPY . /usr/share/nginx/html

# Exponer el puerto 80 (el estándar web)
EXPOSE 80

# Comando para arrancar Nginx
CMD ["nginx", "-g", "daemon off;"]
