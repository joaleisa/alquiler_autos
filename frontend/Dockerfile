FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port Vite uses by default
EXPOSE 5173

# Start the development server
# The --host flag allows access from outside the container
CMD ["npm", "run", "dev", "--", "--host"]