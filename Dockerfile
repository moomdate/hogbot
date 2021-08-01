FROM node:10-alpine
SHELL ["/bin/bash", "-c"]
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
RUN npm run build
ENTRYPOINT npm start
