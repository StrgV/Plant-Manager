FROM node:20-alpine AS builder

WORKDIR /app

# Later on space here for importing .env

COPY package*.json ./

# Install deps
RUN npm ci

COPY . .

# Build
RUN npm run build

# --- Final Stage ---
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install ffmpeg for timelapse video creation
# AND install su-exec to downgrade privileges from root to appuser at runtime
RUN apk add --no-cache ffmpeg su-exec

# Run as non root user for security reasons (Create user and group)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install production deps
COPY --chown=appuser:appgroup package*.json ./
RUN npm ci --omit=dev

# Copy the build app
COPY --chown=appuser:appgroup --from=builder /app/build ./build

# NOTE: We do NOT use the "USER appuser" instruction here.
# We keep the container running as root initially. 
# This allows us to fix volume permissions in the CMD before starting the app.

# Expose port
EXPOSE 3000

# Start
# 1. Create upload directories if they don't exist
# 2. Fix permissions on the static folder (so appuser can write to mounted volumes)
# 3. Use 'exec su-exec' to switch user and start the node process (PID 1)
CMD ["sh", "-c", "mkdir -p /app/static/uploads /app/static/videos && chown -R appuser:appgroup /app/static && exec su-exec appuser:appgroup node build/index.js"]
