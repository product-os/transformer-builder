FROM balenalib/amd64-alpine-node:16.13.2 as builder

COPY . /usr/src/

WORKDIR /usr/src

RUN npm install && npm run build

FROM balenalib/amd64-alpine-node:16.13.2 as runtime

COPY --from=builder /usr/src/build /app
COPY --from=builder /usr/src/node_modules /app/node_modules

WORKDIR /app

ENTRYPOINT ["node"]

CMD ["./src/index.js"]
