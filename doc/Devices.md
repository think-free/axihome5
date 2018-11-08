Devices
-------------------------------------------------------------------

Devices are either : 
- Your IOT devices
- Software gateway that speaks with your devices and translate to mqtt.

We have **two** devices types :

- **Auto discovered**
- **Manual devices**

To implement an auto discovered devices, look at the devices/time application, it a simple devices that register itself and send every seconds the current time

Manual devices doesn't register them self to the core and may not respect the mqtt topic specification for axihome. They should use **axihome/5/field/manual/** as the base topic.
The are registered manualy in the web interface.
