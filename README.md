[![Build Status](https://travis-ci.org/toastmasters-dev/print-agenda.svg?branch=master)](https://travis-ci.org/toastmasters-dev/print-agenda)

# Developing locally with Docker

Build Docker container for Gatsby.

    docker build -t print-agenda .

Run the container and start the development server listening on 0.0.0.0 (since requests into the container will not be coming from localhost).

    docker run --rm -it -p 8000:8000 print-agenda gatsby develop -H 0.0.0.0

Point your browser to http://DOCKER_IP:8000/ (most commonly http://localhost:8000/) to hit the development server.

# Developing locally natively

Make sure you have Node and Yarn installed. Then, install the gatsby app and dependencies.

    yarn global add gatsby-cli
    yarn install

Then, start the development server.

    gatsby develop
