#!/bin/bash

./build-core.sh

for plugins in `ls src/plugins`
do
    ./build-process.sh plugins/$task
done

./clean.sh
