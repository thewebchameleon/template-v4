FROM --platform=$BUILDPLATFORM node:24.21.0-alpine AS build
WORKDIR /source
COPY src/TemplateV4.Website/package*.json ./
RUN npm install --global npm@12.0.2 && npm ci
COPY src/TemplateV4.Website/ ./
RUN npm run build
FROM node:24.21.0-alpine
ENV NODE_ENV=production PORT=4300
WORKDIR /app
COPY --from=build --chown=node:node /source/dist/website ./dist/website
USER node
EXPOSE 4300
CMD ["node", "dist/website/server/server.mjs"]
