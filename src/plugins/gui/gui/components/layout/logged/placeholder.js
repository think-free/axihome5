import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../redux/store.js'

import Dimmer from './widgets/dimmer.js'
import Switch from './widgets/switch.js'
import Light from './widgets/light.js'
import Climate from './widgets/climate.js'

import mainStyle from '../../../styles/global.js'

const layoutStyle = {
    display: 'block',
    position: 'fixed',
    height: 'auto',
    width: 'auto',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    color: mainStyle.textColor,
    backgroundColor: mainStyle.header,
    border: mainStyle.headerBorder,
}

const style = {

    toolBar : {
        position: 'relative',
        float: 'right',
        top: 5,
        right: 5
    },
    title : {
        position: 'fixed',
        top: 40,
        left: 40,
        color: mainStyle.textColor,
        fontSize: "1.2em",

        /*'@media (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait), (min-resolution: 192dpi) and (orientation: portrait)': {
            zoom : 2
        }*/
    },
    content : {
        display: 'block',
        position: 'fixed',
        height: 'calc(100% - 100px)',
        width: 'auto',
        top: 80,
        left: 40,
        right: 40,
        bottom: 40,
        overflowY: 'auto',
        fallbacks: [
            { height: '-moz-calc(100% - 100px)' },
            { height: '-webkit-calc(100% - 100px)' },
            { height: '-o-calc(100% - 100px)' }
        ]
    }
}

const mapStateToProps = (state) => {
    return {
        view : state._view,
    }
}

class PlaceHolder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            places: [],
            devices: [],
        };

        this.getConfig=this.getConfig.bind(this);
        this.close=this.close.bind(this);
        this.renderItems=this.renderItems.bind(this);
        this.renderClimateDevices=this.renderClimateDevices.bind(this);
    }

    async componentDidMount() {

        this.getConfig();
    }

    async getConfig(){

        fetch("/places/getPlaces")
        .then(response => response.json())
        .then(data => this.setState({ places: data }))

        fetch("/core/getDevices")
        .then(response => response.json())
        .then(data => this.setState({ devices: data }))
	}

    close(e) {
        this.props.dispatch(setValue("_view", ""));
    }
    

    render() {

        const places = this.state.places;
        const me = this;

        if (this.props.view != undefined && this.props.view != "") {
            return (
                <div style={layoutStyle}>
                   <span style={style.toolBar}>
                        <img key="bt_exit" style={mainStyle.menuIcon} src="/static/close.png" width="25" height="25" draggable="false" onClick={this.close}/>
                    </span>
                    <span style={style.title}>{this.props.view}</span>
                    <div style={style.content}>
                        {places && Array.isArray(places) && places.map(function(place){

                            if (place.name == me.props.view){
                                console.log("Found place with devices, rendering items")
                                return(
                                    me.renderItems(place.devices)
                                )
                            } else {

                                return (null);
                            }
                        })}
                    </div>
                </div>
            );
        } else {

            return (null);
        }
    }

    renderItems(placeDevices) {

        var devices = this.state.devices;

        console.log("Building items map for this place");

        var climate = [];
        var dimmers = [];
        var switches = [];
        var lights = [];

        for (var i=0; i<placeDevices.length; i++) {

            for (var j=0; j<devices.length; j++) {

                if (placeDevices[i] === devices[j].homeId + "." + devices[j].group + "." + devices[j].name){

                    console.log("Found device : " + placeDevices[i] + " of type : " + devices[j].type)

                    if (devices[j].type == "climate")
                        climate.push(devices[j])
                    else if (devices[j].type == "dimmer")
                        dimmers.push(devices[j])
                    else if (devices[j].type == "switch")
                        switches.push(devices[j])
                    else if (devices[j].type == "light")
                        lights.push(devices[j])
                }
            }
        }

        return (
         
            <div>
                {this.renderClimateDevices(climate)}
                <br />
                {this.renderDimmerDevices(dimmers)}
                <br />
                {this.renderSwitchesDevices(switches)}
                <br />
                {this.renderLightsDevices(lights)}
            </div>
        )
    }

    renderClimateDevices(devices) {

        return(
            <div>
                {devices && Array.isArray(devices) && devices.map(function(device){

                    var dev = device.homeId + "." + device.group + "." + device.name;

                    console.log("Rendering climate : " + dev);
                    return (
                        <Climate name={dev} device={device}/>
                    )
                })}
            </div>
        )
    }

    renderDimmerDevices(devices) {

        return(
            <div>
                {devices && Array.isArray(devices) && devices.map(function(device){

                    var dev = device.homeId + "." + device.group + "." + device.name;

                    console.log("Rendering dimmer : " + dev);
                    return (
                        <Dimmer name={dev} device={device}/>
                    )
                })}
            </div>
        )
    }

    renderSwitchesDevices(devices) {

        return(
            <div>
                {devices && Array.isArray(devices) && devices.map(function(device){

                    var dev = device.homeId + "." + device.group + "." + device.name;

                    console.log("Rendering switch : " + dev);
                    return (
                        <Switch name={dev} device={device}/>
                    )
                })}
            </div>
        )
    }

    renderLightsDevices(devices) {

        return(
            <div>
                {devices && Array.isArray(devices) && devices.map(function(device){

                    var dev = device.homeId + "." + device.group + "." + device.name;

                    console.log("Rendering light : " + dev);
                    return (
                        <Light name={dev} device={device}/>
                    )
                })}
            </div>
        )
    }
}

PlaceHolder = Radium(PlaceHolder);
export default connect(mapStateToProps)(PlaceHolder);


// http://172.16.20.20/places/getPlaces
// http://172.16.20.20/core/getDevices
