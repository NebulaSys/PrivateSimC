# Use the official lightweight Node.js 12 image.
# https://hub.docker.com/_/node
FROM node:14-alpine

RUN apk --no-cache add --virtual build_dependencies \
        libcurl \
        libgcc \
        libstdc++
# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production
# Copy local code to the container image.
COPY . ./

RUN chmod 777 ./simc
RUN chmod a+rwx -R ./simc
# Run the web service on container startup.
CMD [ "npm", "start" ]
