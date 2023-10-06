FROM node:18-alpine
WORKDIR /
COPY package*.json ./
RUN npm install --production
RUN npm i typescript
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "build/index.js"]