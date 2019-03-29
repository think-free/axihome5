wget  https://raw.githubusercontent.com/sivel/speedtest-cli/master/speedtest.py
python speedtest.py > test.log; cat test.log  | grep Download; cat test.log | grep Upload

https://hub.docker.com/r/eminguez/speedtest2mqtt/