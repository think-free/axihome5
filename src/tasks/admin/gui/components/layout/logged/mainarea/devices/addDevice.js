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
        marginLeft: 10
    },
    panel : {
        color: mainStyle.textColor,
        marginTop: 10,
        minHeight: 40,
        width: "100%",
        backgroundColor: mainStyle.panelBackgroundColor,
        cursor: "pointer"
    }
}

const mapStateToProps = (state) => {
    return {
        addPanelVisible: state.addPanelVisible,
        editVariable : state.editVariable
    }
}

class DeviceAdd extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

            deviceId : "",
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

        this.formDeviceTypeChanged=this.formDeviceTypeChanged.bind(this);
        this.formDeviceHomeIDChanged=this.formDeviceHomeIDChanged.bind(this);
        this.formDeviceGroupChanged=this.formDeviceGroupChanged.bind(this);
        this.formDeviceNameChanged=this.formDeviceNameChanged.bind(this);

        this.formVariableTypeChanged=this.formVariableTypeChanged.bind(this);
        this.formVariableNameChanged=this.formVariableNameChanged.bind(this);
        this.formVariableStatusChanged=this.formVariableStatusChanged.bind(this);
        this.formVariableCmdChanged=this.formVariableCmdChanged.bind(this);

        this.addVariable=this.addVariable.bind(this);
        this.deleteVariable=this.deleteVariable.bind(this);
        this.setCurrentVariable=this.setCurrentVariable.bind(this);

        if (this.props.editVariable != undefined && this.props.editVariable != null){

            const edit = this.props.editVariable;

            this.state.deviceId = edit.id;
            this.state.deviceType = edit.type;
            this.state.deviceHomeId = edit.homeId;
            this.state.deviceGroup = edit.group;
            this.state.deviceName = edit.name;
            this.state.variables = edit.variables
        }
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

        if (this.state.deviceId == "") { // Add New

            this.post("/core/addDeviceConfig", JSON.stringify(
                {
                    id: this.state.deviceHomeId + "." + this.state.deviceGroup + "." + this.state.deviceName,
                    type: this.state.deviceType,
                    name: this.state.deviceName,
                    group: this.state.deviceGroup,
                    homeId: this.state.deviceHomeId,
                    variables : this.state.variables
                }
            ))

        } else { // Modify existing device

            this.post("/core/modifyDeviceConfig", JSON.stringify(
                {
                    id: this.state.deviceId,
                    type: this.state.deviceType,
                    name: this.state.deviceName,
                    group: this.state.deviceGroup,
                    homeId: this.state.deviceHomeId,
                    variables : this.state.variables
                }
            ))
        }

        this.props.dispatch(setValue("editVariable", null))
        this.props.dispatch(setValue("addPanelVisible", false))
    }

    cancel(e) {
        this.props.dispatch(setValue("editVariable", null))
        this.props.dispatch(setValue("addPanelVisible", false))
    }

    // Input device handlers

    formDeviceTypeChanged(event) {

        this.state.deviceType = event.target.value
        this.setState({ deviceType: event.target.value })
        console.log("Device type " + this.state.deviceType)
    }
    formDeviceHomeIDChanged(event) {

        this.state.deviceHomeId = event.target.value
        this.setState({ deviceHomeId: event.target.value })
        console.log("Home Id " + this.state.deviceHomeId)
    }
    formDeviceGroupChanged(event) {

        this.state.deviceGroup = event.target.value
        this.setState({ deviceGroup: event.target.value })
        console.log("Group " + this.state.deviceGroup)
    }
    formDeviceNameChanged(event) {

        //this.state.deviceName = event.target.value
        this.setState({ deviceName: event.target.value })
        console.log("Name " + this.state.deviceName)
    }

    // Input variables handlers

    formVariableTypeChanged(event) {

        //this.state.variableType = event.target.value
        this.setState({ variableType: event.target.value })
        console.log("Variable type " + this.state.variableType)
    }
    formVariableNameChanged(event) {

        //this.state.variableName = event.target.value
        this.setState({ variableName: event.target.value })
        console.log("Variable name " + this.state.variableName)
    }
    formVariableStatusChanged(event) {

        //this.state.variableStatusTopic = event.target.value
        this.setState({ variableStatusTopic: event.target.value })
        console.log("Variable status topic " + this.state.variableStatusTopic)
    }
    formVariableCmdChanged(event) {

        //this.state.variableCmdTopic = event.target.value
        this.setState({ variableCmdTopic: event.target.value })
        console.log("Variable cmd topic " + this.state.variableCmdTopic)
    }

    addVariable(e) {

        // Delete variable if already inserted
        let variablesDelete = this.state.variables;
        let name = this.state.variableName;
        var variables = variablesDelete.filter(function(value, index, arr){

            if (value.name != name){
                console.log("Deleting : " + name)
                return true;
            }

            return false;
        });

        // Add
        let variable = {
            name : this.state.variableName,
            type : this.state.variableType,
            status : this.state.variableStatusTopic,
            statusTemplate : "",
            cmd: this.state.variableCmdTopic,
            cmdTemplate : ""
        }

        //let variables = this.state.variables;
        variables.push(variable)

        this.forceUpdate();
        this.setState({ variables: variables })
    }

    deleteVariable(name) {

        let variables = this.state.variables;

        console.log("Delete called " + name)
        console.log(variables)

        var filtered = variables.filter(function(value, index, arr){

            if (value.name != name){
                console.log("Deleting : " + name)
                return true;
            }

            return false;
        });

        this.setState({ variables: filtered });
    }

    setCurrentVariable(name) {

        console.log(name)

        const v = this.state.variables;

        for (var i = 0; i < v.length; i++) {


            if (v[i].name === name){

                console.log("Found : " + v[i].name)
                this.setState({ variableType: v[i].type })
                this.setState({ variableName: v[i].name })
                this.setState({ variableStatusTopic: v[i].status })
                this.setState({ variableCmdTopic: v[i].cmd })
            }
        }
    }

    // Render

    render() {

        console.log(variables)

        const variables = this.state.variables
        const me = this;

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
                                <select key="ip_type" value={this.state.deviceType} onChange={this.formDeviceTypeChanged} onBlur={this.formDeviceTypeChanged}>
                                    <option value="switch">Switch</option>
                                    <option value="light">Light</option>
                                    <option value="dimmer">Dimmer</option>
                                    <option value="shutter">Shutter</option>
                                    <option value="position">Position</option>
                                    <option value="occupancy">Occupancy</option>
                                    <option value="time">Time</option>
                                    <option value="climate">Climate</option>
                                    <option value="power">Power</option>
                                    <option value="audio">Audio Controler</option>
                                    <option value="analog">Analog Sensor (Any number)</option>
                                    <option value="digital">Digital Sensor (0-1)</option>
                                    <option value="text">Text</option>
                                    <option value="custom">Custom (None of the above)</option>
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
                            <td><input key="ip_homeId" style={mainStyle.inputStyle} type="text" value={this.state.deviceHomeId} onChange={this.formDeviceHomeIDChanged} onBlur={this.formDeviceHomeIDChanged}/></td>
                        </tr>
                        <tr>
                            <td style={devicesStyle.item}>Group</td>
                            <td> </td>
                            <td><input key="ip_group" style={mainStyle.inputStyle} type="text" value={this.state.deviceGroup} onChange={this.formDeviceGroupChanged} onBlur={this.formDeviceGroupChanged}/></td>
                        </tr>
                        <tr>
                            <td style={devicesStyle.item}>Name</td>
                            <td> </td>
                            <td><input key="ip_name" style={mainStyle.inputStyle} type="text" value={this.state.deviceName} onChange={this.formDeviceNameChanged} onBlur={this.formDeviceNameChanged}/></td>
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
                                <select key="ip_type" onChange={this.formVariableTypeChanged} onBlur={this.formVariableTypeChanged} value={this.state.variableType}>

                                    <option value="digital">Digital (0-1)</option>
                                    <option value="analog">Analog (0-255)</option>
                                    <option value="number">Number (Any value)</option>
                                    <option value="text">Text</option>
                                    <option value="position">Position [x,y]</option>
                                    <option value="rgb">Rgb [r,g,b]</option>
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
                            <td><input key="ip_vName" style={mainStyle.inputStyle} type="text" onChange={this.formVariableNameChanged} onBlur={this.formVariableNameChanged} value={this.state.variableName}/></td>
                        </tr>
                        <tr>
                            <td style={devicesStyle.item}>Status topic</td>
                            <td> </td>
                            <td><input key="ip_vStatus" style={mainStyle.inputStyle} type="text" onChange={this.formVariableStatusChanged} onBlur={this.formVariableStatusChanged} value={this.state.variableStatusTopic}/></td>
                        </tr>
                        <tr>
                            <td style={devicesStyle.item}>Cmd topic</td>
                            <td> </td>
                            <td><input key="ip_vCmd" style={mainStyle.inputStyle} type="text" onChange={this.formVariableCmdChanged} onBlur={this.formVariableCmdChanged} value={this.state.variableCmdTopic}/></td>
                        </tr>
                    </table>

                    <br />

                        {variables && variables.map(function(variable){

                            return (
                                <div style={devicesStyle.panel} onClick={() => me.setCurrentVariable(variable.name)}>
                                    <table style={devicesStyle.tableVariables}>
                                        <col width="60px" align="center"/>
                                        <col width="80px"/>
                                        <col width="150px"/>
                                        <col width="25px" align="center"/>
                                        <col />

                                        <tr>
                                            <td><img key={"delete_button_" + variable.name} style={mainStyle.menuIcon} src="/admin/static/delete.png" width="15" height="15" draggable="false" onClick={() => me.deleteVariable(variable.name)}/></td>
                                            <td>{variable.type}</td>
                                            <td style={devicesStyle.item}>{variable.name}</td>
                                            <td><img src="/admin/static/read.png" width="15" height="15" draggable="false" /></td>
                                            <td>{variable.status}</td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td><img src="/admin/static/write.png" width="15" height="15" draggable="false" /></td>
                                            <td>{variable.cmd}</td>
                                        </tr>
                                    </table>
                                </div>
                            )
                        })}
                </div>
            </div>
        )
    }
}

/* Export */
DeviceAdd = Radium(DeviceAdd);
export default connect(mapStateToProps)(DeviceAdd);
