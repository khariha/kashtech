# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Serve stage
FROM node:18
WORKDIR /app
RUN npm install -g http-server
COPY --from=builder /app/dist .
EXPOSE 8080
CMD ["http-server", "-p", "8080"]
