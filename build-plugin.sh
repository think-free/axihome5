#!/bin/bash

go get -u github.com/GeertJohan/go.rice
go get -u github.com/GeertJohan/go.rice/rice
go get -u github.com/golang/dep/cmd/dep

PT=`pwd`

echo "Building plugin $1"

cd src/plugins/$1

if [ -d ./gui ];
then
    echo "Building plugin's gui"
    cd gui
    npm install
    npm run build
    npm run export
    cd ..
    cd webserver
    rice embed-go
    cd ..
fi

dep ensure

cd $PT
go install plugins/$1
