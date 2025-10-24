# Frontend Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy dependency files
COPY jobby-frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY jobby-frontend/ .

# Expose port 5173 (Vite default)
EXPOSE 5173

# Run dev server
CMD ["npm", "run", "dev", "--", "--host"]
