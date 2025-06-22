# Use an official Node.js runtime as a base image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the port your app runs on (default: 8080 for GCP)
EXPOSE 8080

# Start the application
CMD [ "npm", "start" ]
