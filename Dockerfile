FROM node:18-alpine
WORKDIR /
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "build/index.js"]