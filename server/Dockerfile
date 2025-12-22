FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Install tsx globally for running seed script
RUN npm install -g tsx

# Copy built application and source files needed for seeding
COPY --from=base /app/dist ./dist
COPY --from=base /app/src ./src
COPY --from=base /app/tsconfig.json ./tsconfig.json

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
