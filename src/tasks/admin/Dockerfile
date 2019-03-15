# First stage, building gui
FROM node:alpine AS node-env

ARG app="admin"

ADD ./src/tasks/$app/gui /src
WORKDIR /src
RUN npm install -g yarn
RUN yarn install && npm run build && npm run export


# Second stage, building application
FROM golang:alpine AS builder

ARG app="admin"

RUN apk update && apk add git
RUN go get -u github.com/golang/dep/cmd/dep && mv $GOPATH/bin/dep /usr/bin/
RUN go get -u github.com/GeertJohan/go.rice && go get -u github.com/GeertJohan/go.rice/rice && mv $GOPATH/bin/rice /usr/bin/

ADD . $GOPATH

COPY --from=node-env src/out $GOPATH/src/tasks/$app/gui/out
WORKDIR $GOPATH/src/tasks/$app/webserver
RUN rice embed-go

WORKDIR $GOPATH/src/tasks/$app
RUN dep ensure
WORKDIR $GOPATH/
RUN go build tasks/$app

# Last stage : Creating final container
FROM alpine
WORKDIR /
COPY --from=builder /go/admin /admin
ENTRYPOINT /admin
