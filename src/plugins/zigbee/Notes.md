
* Frames *
***************************************

zigbee2mqtt/bridge/state <- online
zigbee2mqtt/bridge/log <- {"type":"TYPE","message":"MESSAGE"}

zigbee2mqtt/bridge/config/permit_join -> true|false

zigbee2mqtt/0x00158d0002c8ee01 <- {"temperature":25.43,"linkquality":149,"humidity":35.41,"pressure":1013}

zigbee2mqtt/[DEVICE_ID] <-
zigbee2mqtt/[DEVICE_ID]/set ->

{
    "state": "ON", // Or "OFF", "TOGGLE"
    "brightness": 255,
    "color_temp": 155,
    "color": {
        "r": 46,
        "g": 102,
        "b": 193
    }
}

* Devices types *
***************************************

climate :

    temperature float
    humidity float
    pressure int


switch :

    click "" -> int

occupancy :

    occupancy bool

light :

    state "ON" | "OFF"
    brightness int
    color_temp int

    color obj {
                r int
                g int
                b int}


linkquality int
battery int



* Internal structure *
***************************************

ZigbeeID
Home
Group
Instance
ValuesMap
