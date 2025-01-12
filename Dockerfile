# Etapa de construcción
FROM node:18 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa de producción
FROM nginx:alpine
COPY --from=build /app/dist/dipier /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
