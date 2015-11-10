FROM node:0.10.38-onbuild

RUN mkdir -p /vault

EXPOSE 3000
VOLUME /vault
