FROM node:carbon-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm i

EXPOSE 3002

CMD [ "node", "./server.js" ]
