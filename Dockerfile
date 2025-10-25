FROM node:20-bullseye

# Install canvas dependencies
RUN apt-get update && apt-get install -y \
  libexpat1 \
  libcairo2 \
  libpango1.0-0 \
  libjpeg-dev \
  libpng-dev \
  libgif-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]