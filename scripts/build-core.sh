#!/bin/bash

go get -u github.com/GeertJohan/go.rice
go get -u github.com/GeertJohan/go.rice/rice
go get -u github.com/golang/dep/cmd/dep

PT=`pwd`

echo "Building core"

cd src/core
dep ensure

cd $PT
go install core
