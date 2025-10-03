FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

RUN npm i -g serve

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
