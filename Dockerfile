# Use Node.js LTS as the base image
FROM node:20-alpine

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend
RUN npm run build

# Create backup directory
RUN mkdir -p /backup

# Expose port 3000
EXPOSE 3000

# Define volume for persistence
VOLUME /backup

# Define environment variable for production
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]