FROM docker:dind as base

ENV DOCKER_HOST=unix:///var/run/docker.sock

RUN apk --no-cache add \
    nodejs \
    npm

COPY . /usr/src/transformer

WORKDIR /usr/src/transformer

RUN npm install \
    && npm cache verify \
    && npm run build \
    && chmod u+x scripts/entrypoint.sh

ENTRYPOINT ["scripts/entrypoint.sh"]

CMD ["node", "./build/src/transformer-entrypoint.js"]
