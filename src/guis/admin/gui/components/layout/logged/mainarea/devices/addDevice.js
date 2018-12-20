import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../../../redux/store.js'

import mainStyle from '../../../../../styles/global.js'

/* Devices */

const devicesStyle = {

    p100 : {
        height: '100%',
        display:'block'
    },
    toolBar : {
        position: 'relative',
        float: 'right'
    },
    mainArea : {
        display:'block',
        position: 'relative',
        marginTop: 50,
        height: 'calc(100% - 50px)',
        width: '100%',
        fallbacks: [
            { height: '-moz-calc(100% - 50px)' },
            { height: '-webkit-calc(100% - 50px)' },
            { height: '-o-calc(100% - 50px)' }
        ],
        overflowY: 'auto'
    },
    title : {
        color: mainStyle.title,
        fontSize: '1.5em'
    },
    item : {
        color: mainStyle.textItemColor
    },
    table : {
        marginLeft: 20
    }
}

const mapStateToProps = (state) => {
    return {
        addPanelVisible: state.addPanelVisible
    }
}

class DeviceAdd extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

            deviceType : "switch",
            deviceHomeId : "",
            deviceGroup : "",
            deviceName : ""
        };

        // Buttons handlers
        this.sendNewDevice=this.sendNewDevice.bind(this);
        this.cancel=this.cancel.bind(this);

        this.formDeviceTypeChanged=this.formDeviceTypeChanged.bind(this);
        this.formDeviceHomeIDChanged=this.formDeviceHomeIDChanged.bind(this);
        this.formDeviceGroupChanged=this.formDeviceGroupChanged.bind(this);
        this.formDeviceNameChanged=this.formDeviceNameChanged.bind(this);
    }

    // Button handler

    sendNewDevice(e) {
        /*this.post("/core/addDeviceConfig", JSON.stringify(
            {
                id: this.state.deviceHomeId + "." + this.state.deviceGroup + "." + this.state.deviceName,
                type: this.state.deviceType,
                name: this.state.deviceName,
                group: this. state.deviceGroup,
                homeId: this.state.deviceHomeId
            }
        ))*/

        this.props.dispatch(setValue("addPanelVisible", false))
    }

    cancel(e) {
        this.props.dispatch(setValue("addPanelVisible", false))
    }

    // Input device handlers

    formDeviceTypeChanged(event) {

        this.state.deviceType = event.target.value
        console.log("Device type " + this.state.deviceType)
    }

    formDeviceHomeIDChanged(event) {

        this.state.deviceHomeId = event.target.value
        console.log("Home Id " + this.state.deviceHomeId)
    }

    formDeviceGroupChanged(event) {

        this.state.deviceGroup = event.target.value
        console.log("Group " + this.state.deviceGroup)
    }

    formDeviceNameChanged(event) {

        this.state.deviceName = event.target.value
        console.log("Name " + this.state.deviceName)
    }

    // Render

    render() {

        return (
            <div style={devicesStyle.p100}>
                <span style={devicesStyle.toolBar}>
                    <img key="bt_ok" style={mainStyle.menuIcon} src="/admin/static/ok.png" width="20" height="20" draggable="false" onClick={this.sendNewDevice}/>
                    <img key="bt_cancel" style={mainStyle.menuIcon} src="/admin/static/cancel.png" width="20" height="20" draggable="false" onClick={this.cancel}/>
                </span>

                <div style={devicesStyle.mainArea}>

                    <div style={devicesStyle.title}>Device configuration</div><br />

                    <table style={devicesStyle.table}>
                        <tr>
                            <td style={devicesStyle.item}>Type</td>
                            <td> </td>
                            <td align="right">
                                <select key="ip_type" onBlur={this.formDeviceTypeChanged}>
                                    <option value="switch">Switch</option>
                                    <option value="dimmer">Dimmer</option>
                                    <option value="rgb">Rgb</option>
                                    <option value="shutter">Shutter</option>
                                    <option value="position">Position</option>
                                    <option value="time">Time</option>
                                    <option value="climate">Climate</option>
                                    <option value="audio">Audio</option>
                                    <option value="analog">Analog</option>
                                    <option value="digital">Digital</option>
                                    <option value="text">Text</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={devicesStyle.item}>Home ID</td>
                            <td> </td>
                            <td><input key="ip_homeId" style={mainStyle.inputStyle} type="text" onBlur={this.formDeviceHomeIDChanged}/></td>
                        </tr>
                        <tr>
                            <td style={devicesStyle.item}>Group</td>
                            <td> </td>
                            <td><input key="ip_group" style={mainStyle.inputStyle} type="text" onBlur={this.formDeviceGroupChanged}/></td>
                        </tr>
                        <tr>
                            <td style={devicesStyle.item}>Name</td>
                            <td> </td>
                            <td><input key="ip_name" style={mainStyle.inputStyle} type="text" onBlur={this.formDeviceNameChanged}/></td>
                        </tr>
                    </table>

                    <br/>
                    <div style={mainStyle.line}/>
                    <br/>

                    <span style={devicesStyle.toolBar}>
                        <img key="bt_addVariable" style={mainStyle.menuIcon} src="/admin/static/add.png" width="20" height="20" draggable="false" onClick={this.toggleAddPanelVisible}/>
                    </span>

                    <div style={devicesStyle.title}>Add variables</div><br />

                    <table style={devicesStyle.table}>
                        <tr>
                            <td style={devicesStyle.item}>Type</td>
                            <td> </td>
                            <td align="right">
                                <select key="ip_type" onBlur={this.formDeviceTypeChanged}>

                                    <option value="digital">Digital</option>
                                    <option value="analog">Analog</option>
                                    <option value="number">Number</option>
                                    <option value="text">Text</option>
                                    <option value="position">Position</option>
                                    <option value="rgb">Rgb</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={devicesStyle.item}>Name</td>
                            <td> </td>
                            <td><input key="ip_vName" style={mainStyle.inputStyle} type="text" onBlur={this.formDeviceHomeIDChanged}/></td>
                        </tr>
                        <tr>
                            <td style={devicesStyle.item}>Status topic</td>
                            <td> </td>
                            <td><input key="ip_vStatus" style={mainStyle.inputStyle} type="text" onBlur={this.formDeviceGroupChanged}/></td>
                        </tr>
                        <tr>
                            <td style={devicesStyle.item}>Cmd topic</td>
                            <td> </td>
                            <td><input key="ip_vCmd" style={mainStyle.inputStyle} type="text" onBlur={this.formDeviceNameChanged}/></td>
                        </tr>
                    </table>
                </div>
            </div>
        )
    }
}


/* Export */

DeviceAdd = Radium(DeviceAdd);
export default connect(mapStateToProps)(DeviceAdd);
