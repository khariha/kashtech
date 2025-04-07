# Stage 1: Build React App using Node.js on Windows
FROM mcr.microsoft.com/windows/servercore:ltsc2022 AS builder

SHELL ["cmd", "/S", "/C"]

# Install Node.js manually
ADD https://nodejs.org/dist/v18.19.1/node-v18.19.1-x64.msi nodejs.msi
RUN start /wait msiexec /i nodejs.msi /quiet /norestart && del nodejs.msi

WORKDIR C:\app
COPY . .

RUN npm install
RUN npm run build

# Stage 2: Serve the built app using http-server
FROM mcr.microsoft.com/windows/servercore:ltsc2022

SHELL ["cmd", "/S", "/C"]

# Install Node.js again in the final image
ADD https://nodejs.org/dist/v18.19.1/node-v18.19.1-x64.msi nodejs.msi
RUN start /wait msiexec /i nodejs.msi /quiet /norestart && del nodejs.msi

# Install http-server globally
RUN npm install -g http-server

WORKDIR C:\app
COPY --from=builder C:\app\dist .

EXPOSE 8080

CMD ["cmd", "/C", "http-server -p 8080"]
