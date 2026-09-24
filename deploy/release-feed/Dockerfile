FROM node:26.10.0-bookworm-slim
WORKDIR /app
COPY tools/releases/contracts.mjs tools/releases/contracts.mjs
COPY deploy/release-feed/server.mjs deploy/release-feed/server.mjs
RUN mkdir /data && chown node:node /data
USER node
EXPOSE 8080
CMD ["node", "deploy/release-feed/server.mjs"]
