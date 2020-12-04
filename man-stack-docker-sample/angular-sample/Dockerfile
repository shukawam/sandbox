FROM node:12.14.1

RUN npm install -g @angular/cli

WORKDIR /angular-sample

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 4200