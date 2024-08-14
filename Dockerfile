# syntax=docker/dockerfile:experimental
FROM 950474957737.dkr.ecr.eu-central-1.amazonaws.com/nodejs-base:20-slim
# Add code to image
ADD --chown=node . /usr/src/app

# Set owner of root directory itself
RUN chown node:node /usr/src/app

USER node

RUN --mount=type=secret,id=npmrc,uid=1000,dst=/home/node/.npmrc npm ci \
 && npm run build && npm prune --production

EXPOSE 8181

CMD ["npm", "run", "start"]
