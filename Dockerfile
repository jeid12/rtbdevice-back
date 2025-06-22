# Base image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /src

# Copy only package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project files (including src/)
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the port your app runs on
EXPOSE 8080

# Run the built app
CMD ["node", "dist/index.js"]
