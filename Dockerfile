# Etapa 1: Construcción de la aplicación
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine

# Copia los archivos construidos desde la etapa de construcción
COPY --from=build /app/build /usr/share/nginx/html

# Copia configuración personalizada de Nginx
COPY default.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80
EXPOSE 80

# Comando para ejecutar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
