FROM node:12.14.1

RUN npm install -g @angular/cli

WORKDIR /webauthn-client

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 4200