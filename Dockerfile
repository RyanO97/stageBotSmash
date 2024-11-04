FROM mysql:8.0.37

# Copy the SQL dump file into the initialization directory
COPY ./init-scripts/smashultimatesingles.sql /docker-entrypoint-initdb.d/

FROM node:22.10.0-alpine3.20

# Use production node environment by default.
ENV NODE_ENV=production


WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
USER root
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm cache clean --force \
    && npm ci --omit=dev 
# Run the application as a non-root user.
USER node
# Copy the rest of the source files into the image.
COPY . .

# Run the application.
CMD npm start