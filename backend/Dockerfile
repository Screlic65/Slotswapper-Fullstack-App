# 1. Use an official Node.js runtime as the base image.
# 'alpine' is a lightweight version of Linux, great for small images.
FROM node:18-alpine

# 2. Set the working directory inside the container.
WORKDIR /app

# 3. Copy package.json and package-lock.json first.
# This is a key Docker optimization. It uses the cache layer for dependencies
# unless these files change, making subsequent builds much faster.
COPY package*.json ./

# 4. Install the application dependencies inside the container.
RUN npm install

# 5. Copy the rest of your application's source code into the container.
COPY . .

# 6. Inform Docker that the container listens on port 5000 at runtime.
EXPOSE 5000

# 7. Define the command to run your application when the container starts.
# We use "npm run dev" to leverage nodemon for auto-reloading during development.
CMD ["npm", "run", "dev"]