
FROM node:latest
WORKDIR /app
COPY dist .
COPY package.json .
COPY webserver.js .
RUN npm install
CMD ["node", "webserver.js"]
EXPOSE 8080