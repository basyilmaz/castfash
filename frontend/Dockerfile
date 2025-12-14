# Production Dockerfile for Next.js
FROM node:20-alpine

WORKDIR /app

# Install dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build
RUN npm run build

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
