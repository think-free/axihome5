#!/bin/bash

echo "Getting rice and dep"

if ! [ -x "$(command -v rice)" ];
then
	go get -u github.com/GeertJohan/go.rice
	go get -u github.com/GeertJohan/go.rice/rice
fi

if ! [ -x "$(command -v dep)" ];
then
	go get -u github.com/golang/dep/cmd/dep
fi

PT=`pwd`

echo "Building task $1"

cd src/tasks/$1

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

echo "Running dep ensure"
dep ensure

echo "Building task"
cd $PT
go install tasks/$1
