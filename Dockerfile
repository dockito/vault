FROM mhart/alpine-node:0.10

RUN mkdir -p /vault /vault/store /usr/src/app

WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app/
RUN ln -s /usr/src/app/credentials /usr/bin/credentials

EXPOSE 3000
VOLUME /vault

CMD [ "npm", "start" ]
