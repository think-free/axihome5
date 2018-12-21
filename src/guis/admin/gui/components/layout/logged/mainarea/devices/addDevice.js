import React from 'react'
import Radium from 'radium';
import fetch from 'isomorphic-unfetch';
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
    },
    tableVariables : {
        marginLeft: 50
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
            deviceName : "",

            variableType : "digital",
            variableName : "",
            variableStatusTopic : "",
            variableCmdTopic : "",

            variables : []
        };

        // Buttons handlers
        this.sendNewDevice=this.sendNewDevice.bind(this);
        this.cancel=this.cancel.bind(this);
        this.addVariable=this.addVariable.bind(this);

        this.formDeviceTypeChanged=this.formDeviceTypeChanged.bind(this);
        this.formDeviceHomeIDChanged=this.formDeviceHomeIDChanged.bind(this);
        this.formDeviceGroupChanged=this.formDeviceGroupChanged.bind(this);
        this.formDeviceNameChanged=this.formDeviceNameChanged.bind(this);

        this.formVariableTypeChanged=this.formVariableTypeChanged.bind(this);
        this.formVariableNameChanged=this.formVariableNameChanged.bind(this);
        this.formVariableStatusChanged=this.formVariableStatusChanged.bind(this);
        this.formVariableCmdChanged=this.formVariableCmdChanged.bind(this);
    }

    // Button handler

    post (url, json) {
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: json
        })
    }

    sendNewDevice(e) {
        this.post("/core/addDeviceConfig", JSON.stringify(
            {
                id: this.state.deviceHomeId + "." + this.state.deviceGroup + "." + this.state.deviceName,
                type: this.state.deviceType,
                name: this.state.deviceName,
                group: this. state.deviceGroup,
                homeId: this.state.deviceHomeId,
                variables : this.state.variables
            }
        ))

        this.props.dispatch(setValue("addPanelVisible", false))
    }

    cancel(e) {
        this.props.dispatch(setValue("addPanelVisible", false))
    }

    addVariable(e) {
        let variable = {
            name : this.state.variableName,
            type : this.state.variableType,
            status : this.state.variableStatusTopic,
            statusTemplate : "",
            cmd: this.state.variableCmdTopic,
            cmdTemplate : ""
        }

        let variables = this.state.variables;
        variables.push(variable)

        this.setState({ variables: variables })
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

    // Input variables handlers

    formVariableTypeChanged(event) {

        this.state.variableType = event.target.value
        console.log("Variable type " + this.state.variableType)
    }
    formVariableNameChanged(event) {

        this.state.variableName = event.target.value
        console.log("Variable name " + this.state.variableName)
    }
    formVariableStatusChanged(event) {

        this.state.variableStatusTopic = event.target.value
        console.log("Variable status topic " + this.state.variableStatusTopic)
    }
    formVariableCmdChanged(event) {

        this.state.variableCmdTopic = event.target.value
        console.log("Variable cmd topic " + this.state.variableCmdTopic)
    }

    // Render

    render() {

        const variables = this.state.variables

        return (
            <div style={devicesStyle.p100}>
                <span style={devicesStyle.toolBar}>
                    <img key="bt_ok" style={mainStyle.menuIcon} src="/admin/static/ok.png" width="20" height="20" draggable="false" onClick={this.sendNewDevice}/>
                    <img key="bt_cancel" style={mainStyle.menuIcon} src="/admin/static/cancel.png" width="20" height="20" draggable="false" onClick={this.cancel}/>
                </span>

                <div style={devicesStyle.mainArea}>

                    <div style={devicesStyle.title}>Device configuration</div><br />

                    <table style={devicesStyle.table}>
                        <col width="100px" />
                        <col />
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
                        <img key="bt_addVariable" style={mainStyle.menuIcon} src="/admin/static/add.png" width="20" height="20" draggable="false" onClick={this.addVariable}/>
                    </span>

                    <div style={devicesStyle.title}>Add variables</div><br />

                    <table style={devicesStyle.table}>
                        <col width="100px" />
                        <col />
                        <tr>
                            <td style={devicesStyle.item}>Type</td>
                            <td> </td>
                            <td align="right">
                                <select key="ip_type" onBlur={this.formVariableTypeChanged}>

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
                            <td><input key="ip_vName" style={mainStyle.inputStyle} type="text" onBlur={this.formVariableNameChanged}/></td>
                        </tr>
                        <tr>
                            <td style={devicesStyle.item}>Status topic</td>
                            <td> </td>
                            <td><input key="ip_vStatus" style={mainStyle.inputStyle} type="text" onBlur={this.formVariableStatusChanged}/></td>
                        </tr>
                        <tr>
                            <td style={devicesStyle.item}>Cmd topic</td>
                            <td> </td>
                            <td><input key="ip_vCmd" style={mainStyle.inputStyle} type="text" onBlur={this.formVariableCmdChanged}/></td>
                        </tr>
                    </table>

                    <br />


                    <table style={devicesStyle.tableVariables}>
                        <col width="100px"/>
                        <col />

                        {variables.map(function(variable){
                            return (
                                <tr>
                                    <td style={devicesStyle.item}>{variable.name}</td>
                                    <td>({variable.type})</td>
                                    <td></td>
                                </tr>
                            )
                        })}
                    </table>
                </div>
            </div>
        )
    }
}

/* Export */
DeviceAdd = Radium(DeviceAdd);
export default connect(mapStateToProps)(DeviceAdd);
