# First stage : Compiling

FROM golang:alpine AS builder

ARG sub=""
ARG app="core"

RUN apk update && apk add git
RUN go get -u github.com/golang/dep/cmd/dep
RUN mv $GOPATH/bin/dep /usr/bin

ADD . $GOPATH
WORKDIR $GOPATH/src/$sub/$app
RUN dep ensure
WORKDIR $GOPATH/
RUN go build $app

# Last stage : Creating final container
FROM alpine
WORKDIR /
COPY --from=builder /go/$app ./
ENTRYPOINT ./$app
