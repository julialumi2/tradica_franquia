FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js notifier.js store.js ./
EXPOSE 3000
CMD ["node", "server.js"]
