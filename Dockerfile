## build runner
FROM node:lts-alpine as build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json
COPY package.json .

# Install dependencies
RUN yarn install

# Move source files
COPY src ./src
COPY tsconfig.json .
# COPY public ./public

# Build project
RUN yarn build

## producation runner
FROM node:lts-alpine as prod-runner

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /tmp/app/package.json /app/package.json

# COPY --from=build-runner /tmp/app/public /app/public

# Install dependencies
RUN yarn install --only=production

# Move build files
COPY --from=build-runner /tmp/app/build /app/build


# Start bot
CMD [ "node", "build/main.js" ]
