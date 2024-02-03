FROM node:16-alpine As development

WORKDIR /usr/src/app

COPY apps/orders/package.json ./
COPY apps/orders/package-lock.json ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

COPY apps/orders apps/orders
COPY libs libs

RUN npm install --force

RUN npm run build orders

FROM node:16-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY apps/orders/package.json ./
COPY apps/orders/package-lock.json ./

RUN npm install --force --prod

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/orders/main"]
