FROM node:20-slim as build

ADD . /usr/src/app

WORKDIR /usr/src/app

RUN npm ci && npm run build && npm prune --production

EXPOSE 8181

CMD ["npm", "run", "start"]
