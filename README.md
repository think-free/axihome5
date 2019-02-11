# axihome5
Fifth version of Home Automation server Axihome

I'm doing a (free) home automation software (just a hobby, won't be big and professional like homeassistant, ...) for x86 and arm.

This is a complete rewrite of Axihome.
It's based on Mqtt for communication and Docker for plugins and application tasks.
Mainly written in Go for backend; Frontend is Web based on react.js (and will be based on Flutter and Qt/Qml for native application), plugins are language agnostics if you respect conventions.

User and Developers documentation is on the road (look at the doc folder but it's probably not up to date). If you are interested to use or hack it, please contact me !

## Current state :
- Compiled only for x86 (no docker image for arm) but as it's written in Go, it would be easy to build arm docker images.
- Core is working.
- Basic plugin managment with plugin store working.
- Administration page working (with plugin integration) but need polishing (password protected), ...
- Currentlty working on plugin dev (zigbee, zwave, alarm, place managment, ...)
- Frontend has to be done

## Some screenshoots :

*Devices*
![Devices](https://github.com/think-free/axihome5/raw/master/doc/1.png)
*Devices configuration*
![Devices configuration](https://github.com/think-free/axihome5/raw/master/doc/2.png)
*Variables*
![Variables](https://github.com/think-free/axihome5/raw/master/doc/3.png)
*Plugins*
![Plugins](https://github.com/think-free/axihome5/raw/master/doc/4.png)
*Plugin store*
![Plugin store](https://github.com/think-free/axihome5/raw/master/doc/5.png)
