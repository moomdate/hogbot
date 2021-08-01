FROM node:14.16.0-alpine3.13
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package*.json ./
RUN npm install
COPY --chown=node:node . .
RUN chown app:app node_modules/
ENTRYPOINT npm start
