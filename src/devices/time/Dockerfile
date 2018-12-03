# First stage, building application
FROM golang:alpine AS builder

ARG sub="devices"
ARG app="time"

RUN apk update && apk add git
RUN go get -u github.com/golang/dep/cmd/dep && mv $GOPATH/bin/dep /usr/bin/

ADD . $GOPATH

WORKDIR $GOPATH/src/$sub/$app
RUN dep ensure
WORKDIR $GOPATH/
RUN go build $sub/$app

# Last stage : Creating final container
FROM alpine
WORKDIR /
COPY --from=builder /go/$app ./
ENTRYPOINT ./$app
