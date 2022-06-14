FROM docker:20.10.17 as build

RUN apk --no-cache add \
    nodejs \
    npm

COPY . /usr/src/

WORKDIR /usr/src

RUN npm install \
    && npm cache verify \
    && npm run build \
    && npm run test

ENTRYPOINT ["node"]

CMD ["./build/src/index.js"]
