# Birthday Studio: the app and its API in one image.
# Storage: files under /data by default, or MongoDB (uploads in GridFS) when MONGODB_URI is set.
#   docker build --build-arg VITE_CONTACT_EMAIL=hello@example.com -t birthday-studio .
#   docker run -p 8787:8787 -e PUBLIC_ORIGIN=https://birthday.example.com -v birthday-data:/data birthday-studio
#   docker run -p 8787:8787 -e PUBLIC_ORIGIN=... -e MONGODB_URI=mongodb+srv://... birthday-studio
# Or `docker compose up` for the app plus a MongoDB container.

FROM node:26-alpine AS build
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

FROM node:26-alpine
ENV NODE_ENV=production PORT=8787 DATA_DIR=/data STATIC_DIR=/app/dist
WORKDIR /app
# Runtime packages only (the MongoDB driver); the app itself is pre-built.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:8787/api/health || exit 1
CMD ["node", "--enable-source-maps", "dist-server/index.js"]
