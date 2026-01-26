# BUILD aşaması
FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# SERVE aşaması
FROM nginx:alpine

# React build output
COPY --from=build /app/dist /usr/share/nginx/html

# Custom nginx config (SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
