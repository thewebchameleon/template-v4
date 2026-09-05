FROM node:24.18.0-alpine AS build
WORKDIR /app
COPY src/Web/package*.json ./
RUN npm install --global npm@11.6.4
RUN npm ci
COPY src/Web/ ./
RUN npm run build
FROM nginxinc/nginx-unprivileged:1.30.4-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/web/browser /usr/share/nginx/html
USER 101
EXPOSE 8080
