FROM --platform=$BUILDPLATFORM node:26.10.0-alpine AS build
WORKDIR /source/src/TemplateV4.Angular
COPY src/TemplateV4.Angular/package*.json ./
RUN npm install --global npm@12.1.0
RUN npm ci
COPY src/TemplateV4.Angular/ ./
COPY . /source/
RUN if [ -d /source/.private-modules/npm ]; then npm install --legacy-peer-deps --no-save /source/.private-modules/npm/*.tgz; fi
RUN npm run build
FROM nginxinc/nginx-unprivileged:1.30.5-alpine
COPY deploy/nginx.production.conf /etc/nginx/conf.d/default.conf
COPY --from=build /source/src/TemplateV4.Angular/dist/web/browser /usr/share/nginx/html
USER 101
EXPOSE 8080 8443
