FROM node:10.15.2-alpine

# Create app directory
WORKDIR /app

RUN apk add --no-cache \
    make g++ git ca-certificates

#RUN npm config set unsafe-perm true && npm install -g typescript ts-node

COPY package*.json ./

RUN yarn

COPY . .

#RUN npm run build

EXPOSE 3000

