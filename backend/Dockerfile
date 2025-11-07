# --- Stage 1: Build the application ---
# Use a full Node.js image to build our app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# --- Stage 2: Create the final, lightweight production image ---
# Use the same lightweight base image
FROM node:18-alpine

WORKDIR /app

# Copy the installed dependencies from the 'builder' stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the application code from the 'builder' stage
COPY --from=builder /app ./

# Expose the port the app runs on
EXPOSE 5000

# The command to run the app in production
CMD ["node", "index.js"]
