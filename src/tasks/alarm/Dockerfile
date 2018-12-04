# First stage, building gui
FROM node:alpine AS node-env

ARG sub="tasks"
ARG app="alarm"

ADD ./src/$sub/$app/gui /src
WORKDIR /src
RUN npm install && npm run build && npm run export

# Second stage, building application
FROM golang:alpine AS builder

ARG sub="tasks"
ARG app="alarm"

RUN apk update && apk add git
RUN go get -u github.com/golang/dep/cmd/dep && mv $GOPATH/bin/dep /usr/bin/
RUN go get -u github.com/GeertJohan/go.rice && go get -u github.com/GeertJohan/go.rice/rice && mv $GOPATH/bin/rice /usr/bin/

ADD . $GOPATH

COPY --from=node-env src/out $GOPATH/src/$sub/$app/gui/out
WORKDIR $GOPATH/src/$sub/$app/webserver
RUN rice embed-go

WORKDIR $GOPATH/src/$sub/$app
RUN dep ensure
WORKDIR $GOPATH/
RUN go build $sub/$app

# Last stage : Creating final container
FROM alpine
WORKDIR /
COPY --from=builder /go/alarm /alarm
ENTRYPOINT /alarm
