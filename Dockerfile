# Stage 1: Build React app using Node.js on Windows Server Core
FROM mcr.microsoft.com/windows/servercore:ltsc2022 AS builder

# Install Node.js
ADD https://nodejs.org/dist/v18.19.1/node-v18.19.1-x64.msi nodejs.msi
RUN start /wait msiexec /i nodejs.msi /quiet /norestart && del nodejs.msi

# Set working directory
WORKDIR /app

# Copy source code and build
COPY . .
RUN npm install
RUN npm run build

# Stage 2: Serve using IIS
FROM mcr.microsoft.com/windows/servercore:ltsc2022

# Enable IIS
RUN powershell -Command "Install-WindowsFeature -Name Web-Server"

# Set working directory for IIS content
WORKDIR /inetpub/wwwroot

# Copy built React app from the builder stage
COPY --from=builder /app/dist .

# Expose IIS default port
EXPOSE 80

# Start IIS
CMD ["cmd", "/c", "start /wait w3svc"]
