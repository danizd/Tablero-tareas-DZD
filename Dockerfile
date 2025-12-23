# Build Stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files first to leverage cache
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build argument for API Key
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# Build the application
RUN npm run build

# Production Stage
FROM nginx:alpine

# Install apache2-utils for htpasswd
RUN apk add --no-cache apache2-utils

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build arguments for authentication
ARG AUTH_USER=admin
ARG AUTH_PASS=changeme

# Generate .htpasswd file
RUN htpasswd -bc /etc/nginx/.htpasswd ${AUTH_USER} ${AUTH_PASS}

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
