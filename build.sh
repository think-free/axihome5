#!/bin/bash

./build-core.sh

for task in `ls src/tasks`
do
    ./build-process.sh tasks/$task
done

for device in `ls src/devices`
do
    ./build-process.sh devices/$device
done

for gui in `ls src/guis`
do
    ./build-process.sh guis/$gui
done

./clean.sh
