FROM docker:dind as base

ENV DOCKER_HOST=unix:///var/run/docker.sock

RUN apk --no-cache add \
    nodejs \
    npm

WORKDIR /usr/src/l1-transformer

COPY . /usr/src/l1-transformer

RUN npm install \
    && npm cache verify \
    && npm run build \
    && chmod u+x scripts/entrypoint.sh

FROM base as runtime

ENTRYPOINT ["scripts/entrypoint.sh"]

CMD ["node", "./build/src/index.js"]
