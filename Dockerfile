# Base image
FROM node:18

# Working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Install a lightweight server to serve the build
RUN npm install -g serve

# Serve the app
CMD ["serve", "-s", "dist", "-l", "3000"]

