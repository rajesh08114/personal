# Birthday Studio (Next.js): the app and its API in one image.
# Storage: files under /data by default, or MongoDB (uploads in GridFS) when MONGODB_URI is set.
#   docker build --build-arg NEXT_PUBLIC_CONTACT_EMAIL=hello@example.com -t birthday-studio .
#   docker run -p 8787:8787 -e PUBLIC_ORIGIN=https://birthday.example.com -v birthday-data:/data birthday-studio
#   docker run -p 8787:8787 -e PUBLIC_ORIGIN=... -e MONGODB_URI=mongodb+srv://... birthday-studio
# Or `docker compose up` for the app plus a MongoDB container.
# Behind a reverse proxy or load balancer, also set TRUST_PROXY=1 so rate limits see the visitor's address.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
# NEXT_PUBLIC_* values are baked into the browser bundle, so they are build arguments.
# Server mode on the same origin; client errors are reported to the server's own log.
ARG NEXT_PUBLIC_BIRTHDAY_API_URL=/api
ARG NEXT_PUBLIC_ERROR_REPORT_URL=/api/errors
ARG NEXT_PUBLIC_CONTACT_EMAIL=
ENV NEXT_PUBLIC_BIRTHDAY_API_URL=$NEXT_PUBLIC_BIRTHDAY_API_URL \
    NEXT_PUBLIC_ERROR_REPORT_URL=$NEXT_PUBLIC_ERROR_REPORT_URL \
    NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production PORT=8787 HOSTNAME=0.0.0.0 DATA_DIR=/data NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
# The standalone output carries only the packages the server needs (including the MongoDB driver).
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:8787/api/health || exit 1
CMD ["node", "server.js"]
