FROM node:alpine
WORKDIR /app
RUN yarn global add gatsby-cli
COPY gatsby-config.js package.json yarn.lock ./
COPY src/ ./src/
COPY static/ ./static/
RUN yarn install
CMD ["/usr/bin/env", "gatsby", "build", "--prefix-paths"]
