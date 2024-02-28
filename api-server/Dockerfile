
FROM node:latest
WORKDIR /app
COPY api-server.js .
COPY derivative-server.js .
COPY package.json .
COPY plot-server.js .
COPY trigonometrics.js .
COPY x-intercept-server.js .
COPY y-intercept-server.js .
RUN npm install
CMD ["node", "api-server.js"]
EXPOSE 8001