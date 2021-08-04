#
# ----- build container ----
FROM node:15-alpine AS base
RUN apk update && apk add make g++ python3
# Create app directory
RUN mkdir -p /opt/api/dist

COPY package*.json   /opt/api/
COPY tsconfig.json  /opt/api/

WORKDIR /opt/api

# Install npm modules, then install typescript and then compile code
RUN npm install \
 && npm dedupe

COPY src            /opt/api/src
RUN node_modules/.bin/tsc

# ----- Development container ----
FROM node:15-alpine as devel
ENV NODE_ENV=development
COPY --from=base /opt/api/node_modules /opt/api/node_modules
COPY . /opt/api

WORKDIR /opt/api

# Start command
CMD [ "npm", "run", "dev" ]

# ----- Production container ----
FROM node:15-alpine as prod
ENV NODE_ENV=production
COPY --from=base /opt/api/node_modules /opt/api/node_modules
COPY --from=base /opt/api/dist /opt/api/dist

WORKDIR /opt/api

# Start command
CMD [ "node", "./dist/dummy-agent.js" ]
