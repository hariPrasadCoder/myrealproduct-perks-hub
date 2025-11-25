# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments for environment variables
# Coolify will pass these when "Available at Buildtime" is checked
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY

# Set as environment variables for the build process
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

# Debug: Verify environment variables are set (check build logs)
RUN if [ -z "$VITE_SUPABASE_URL" ]; then echo "WARNING: VITE_SUPABASE_URL is not set!"; else echo "✓ VITE_SUPABASE_URL is set"; fi
RUN if [ -z "$VITE_SUPABASE_PUBLISHABLE_KEY" ]; then echo "WARNING: VITE_SUPABASE_PUBLISHABLE_KEY is not set!"; else echo "✓ VITE_SUPABASE_PUBLISHABLE_KEY is set"; fi

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production image with nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

