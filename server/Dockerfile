FROM node:20-alpine AS builder

WORKDIR /app

# Later on space here for importing .env

COPY package*.json ./

# Install deps
RUN npm ci

COPY . .

# Build
RUN npm run build

# Run
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install ffmpeg for timelapse video creation
RUN apk add --no-cache ffmpeg

# Run as non root user for security reasons
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Give container user privileges for the app directory
RUN chown -R appuser:appgroup /app

USER appuser

# Install production deps
COPY --chown=appuser:appgroup package*.json ./
RUN npm ci --omit=dev

# Copy the build app
COPY --chown=appuser:appgroup --from=builder /app/build ./build

# Expose port
EXPOSE 3000

# Start
CMD ["node", "build/index.js"]