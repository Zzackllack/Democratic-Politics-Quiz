FROM node:20-alpine
WORKDIR /app

COPY applications/backend/package.json ./
RUN apk add --no-cache openssl
RUN npm install

RUN apk add --no-cache curl

COPY applications/backend/prisma ./prisma
COPY applications/backend/src ./src
COPY applications/backend/tsconfig.json ./tsconfig.json

RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "start"]