
Mqtt topics for special requests
-------------------------------------------------------------------

**Request broadcast status**

    axihome/5/admin/status/broadcast - anyvalue

**Request broadcast devices**

    axihome/5/admin/devices/broadcast - anyvalue

**Register task to the core**

Should publish every 30 seconds

    axihome/5/tasks/discover/{name} - task json

Mqtt topics for client communication
-------------------------------------------------------------------

**Read (client subscribe)**

    axihome/5/status/{homeid}/{group}/{name} - value

**Write (client publish)**

    axihome/5/status/{homeid}/{group}/{name}/cmd - value

**Device register (client subscribe)**

    axihome/5/device/discover - client device json

Mqtt topics for field communication (device auto discover)
-------------------------------------------------------------------

**Devices auto discover**

Should publish every 30 seconds

    axihome/5/field/device/discover/{homeid}/{group}/{name} - device json

**Status Read (device publish)**

    axihome/5/field/status/{homeid}/{group}/{name} - value

**Status Write (device subscribe)**

    axihome/5/field/status/{homeid}/{group}/{name}/cmd - value
