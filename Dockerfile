# Use lightweight Node.js base image
FROM node:20-alpine

# Set working directory in container
WORKDIR /src

# Copy package.json and package-lock.json for caching dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Ensure tsc is executable (fixes "tsc: Permission denied" error on Alpine)
RUN chmod +x ./node_modules/.bin/tsc

# Copy all other project files (e.g., src/, tsconfig.json, etc.)
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the port your app runs on
EXPOSE 8080

# Start the server
CMD ["node", "dist/index.js"]
