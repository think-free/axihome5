# First stage, building application
FROM golang:alpine AS builder

ARG app="time"

RUN apk update && apk add git
RUN go get -u github.com/golang/dep/cmd/dep && mv $GOPATH/bin/dep /usr/bin/

ADD . $GOPATH

WORKDIR $GOPATH/src/plugins/$app
RUN dep ensure
WORKDIR $GOPATH/
RUN go build plugins/$app

# Last stage : Creating final container
FROM alpine
WORKDIR /
COPY --from=builder /go/time /time
ENTRYPOINT /time
