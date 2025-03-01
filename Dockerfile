FROM oven/bun:1.0 as base

WORKDIR /app

# Copy package file
COPY package.json ./
# Copy lock file if it exists
COPY bun.lockb* ./

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . .

# Ensure public directory exists and build tailwind styles
RUN mkdir -p ./public && \
    bunx tailwindcss -i ./src/styles/globals.css -o ./public/styles.css || \
    echo "Warning: Failed to build Tailwind CSS, check paths and configuration"

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["bun", "run", "dev"] 