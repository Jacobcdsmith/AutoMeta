FROM ghcr.io/puppeteer/puppeteer:latest

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose remote debugging port
EXPOSE 9222

# Run the automation script
CMD ["node", "poster.js"]
