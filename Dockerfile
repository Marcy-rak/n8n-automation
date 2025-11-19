FROM node:18-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src
COPY schema.sql ./

# Build TypeScript
RUN npm run build

# Create logs directory
RUN mkdir -p logs

# Run as non-root user
USER node

# Default command
CMD ["npm", "run", "scheduler"]
