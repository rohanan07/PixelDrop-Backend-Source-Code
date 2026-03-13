FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

ENV NODE_ENV=production

EXPOSE 8080

COPY . .

RUN npm install

CMD ["node", "src/app.js"]