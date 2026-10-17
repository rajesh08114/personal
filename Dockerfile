# Birthday Studio: the app and its API in one small image (no runtime npm dependencies).
#   docker build --build-arg VITE_CONTACT_EMAIL=hello@example.com -t birthday-studio .
#   docker run -p 8787:8787 -e PUBLIC_ORIGIN=https://birthday.example.com -v birthday-data:/data birthday-studio

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
# Server mode on the same origin; client errors are reported to the server's own log.
ARG VITE_BIRTHDAY_API_URL=/api
ARG VITE_ERROR_REPORT_URL=/api/errors
ARG VITE_CONTACT_EMAIL=
ENV VITE_BIRTHDAY_API_URL=$VITE_BIRTHDAY_API_URL \
    VITE_ERROR_REPORT_URL=$VITE_ERROR_REPORT_URL \
    VITE_CONTACT_EMAIL=$VITE_CONTACT_EMAIL
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production PORT=8787 DATA_DIR=/data STATIC_DIR=/app/dist
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:8787/api/health || exit 1
CMD ["node", "--enable-source-maps", "dist-server/index.js"]
