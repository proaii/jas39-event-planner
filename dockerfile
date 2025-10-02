# Use Node.js
FROM node:20-alpine

# Enable corepack (so pnpm is available)
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy project files
COPY . .

# Build Next.js app
RUN pnpm build

# Expose port
EXPOSE 3000

# Start app
CMD ["pnpm", "start"]
