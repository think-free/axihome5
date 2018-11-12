# First stage : Compiling

FROM golang:alpine AS builder

ARG repo="github.com/think-free/axihome5"
ARG sub=""
ARG app="core"

RUN apk update && apk add git
RUN go get -u github.com/golang/dep/cmd/dep

ADD . src/$repo
WORKDIR $GOPATH/src/$repo
RUN dep ensure
WORKDIR $GOPATH/
RUN go build $repo/$sub/$app && mv $app app

# Last stage : Creating final container
FROM alpine
WORKDIR /
COPY --from=builder /go/app ./
ENTRYPOINT ./app
