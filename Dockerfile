FROM node:15.3.0-alpine3.10

# Create app directory
WORKDIR /app

COPY package*.json ./

RUN yarn

COPY . .

EXPOSE 3000

CMD ["node", "./src/index.js"]
