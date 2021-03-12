# Use the official lightweight Node.js 12 image.
# https://hub.docker.com/_/node
FROM alpine:latest

RUN apk add --update nodejs npm

RUN apk add --update \
 python3 \
 curl \
 which \
 bash

RUN apk --no-cache add --virtual build_dependencies \
        libcurl \
        libgcc \
        libstdc++

RUN curl -sSL https://sdk.cloud.google.com | bash
ENV PATH $PATH:/root/google-cloud-sdk/bin

RUN gsutil cp gs://us.artifacts.stately-rampart-199708.appspot.com/binary/simc ./simc

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . ./
RUN chmod 777 ./simc

# Run the web service on container startup.
CMD [ "npm", "start" ]
