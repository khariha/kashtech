# Stage 1: Build React App
FROM node:18-nanoserver AS builder

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Stage 2: Serve with http-server
FROM node:18-nanoserver
WORKDIR /app
RUN npm install -g http-server
COPY --from=builder /app/build .

EXPOSE 8080
CMD ["http-server", "-p", "8080"]
