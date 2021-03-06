#!/bin/bash

function clean(){

    echo "Cleaning $1"
    rm -rf src/$1/vendor
    rm -rf src/$1/webserver/rice-box.go
    rm -rf src/$1/gui/out
    rm -rf src/$1/gui/node_modules
    rm -rf src/$1/gui/.next
}

rm -rf pkg
rm -rf bin
rm -rf src/github.com
rm -rf src/core/vendor

clean plugins/alarm
clean tasks/admin
clean tasks/plugins
