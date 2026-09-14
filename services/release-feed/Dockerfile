FROM node:24.21.0-bookworm-slim
WORKDIR /app
COPY tools/releases/contracts.mjs tools/releases/contracts.mjs
COPY services/release-feed/server.mjs services/release-feed/server.mjs
RUN mkdir /data && chown node:node /data
USER node
EXPOSE 8080
CMD ["node", "services/release-feed/server.mjs"]
