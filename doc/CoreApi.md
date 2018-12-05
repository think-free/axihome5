
Mqtt topics for special requests
-------------------------------------------------------------------

**[POST:types.Config] Write a configuration json**

    /core/setConfig

**[GET:key,task] Get a configuration json**
    /core/getConfig

**[GET] Get all tasks**
    /core/getTasks

**[GET:name] Delete a task**
    /core/deleteTask

**[GET] Get device configuration**
    /core/getDevicesConfig

**[POST:types.FieldDevice] Add a device configuration**
    /core/addDeviceConfig

    {
        "id": "home.thermometer.test.temperature",
        "status": "axihome/5/field/manual/home/thermometer/test/temperature",
        "statusTemplate": "",
        "cmd": "",
        "cmdTemplate": "",
        "name": "test.temperature",
        "homeId": "home",
        "group": "thermometer",
        "type": "analog"
    }

**[POST:types.FieldDevice] Modify a device configuration**
    /core/modifyDeviceConfig

    {
        "id": "home.thermometer.test.temperature",
        "status": "axihome/5/field/manual/home/thermometer/test/temperature",
        "statusTemplate": "",
        "cmd": "",
        "cmdTemplate": "",
        "name": "test.temperature",
        "homeId": "home",
        "group": "thermometer",
        "type": "analog"
    }

**[GET:id] Delete a device configuration**
    /core/deleteDeviceConfig

**[GET] Get the devices**
    /core/getDevices

**[GET] Get all the values**
    /core/getValues

**[GET:key] Get a specific value**
    /core/getValue

**[TO BE IMPLEMENTED] Write a value**
    /core/writeValue

**[TO BE IMPLEMENTED] Force a value (don't write to device)**
    /core/forceValue

**[GET:key] Delete a value**
    /core/deleteValue
