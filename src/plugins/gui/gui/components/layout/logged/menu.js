import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../redux/store.js'

import mainStyle from '../../../styles/global.js'

const layoutStyle = {
    display: 'block',
    position: 'fixed',
    height: 'auto',
    overflowY: 'auto',
    width: 'auto',
    top: 100,
    left: 20,
    right: 20,
    bottom: 20,
    color: mainStyle.textColor,
    backgroundColor: mainStyle.header,
    border: mainStyle.headerBorder
}

const placesStyle = {

    place : {
        marginTop: 10
    },
    cellStyle : {
        display: 'block',
        float: 'left',
        height: '200px',
        width: '200px',
        userSelect:'none'
    },
    cellContent : {
        position: 'relative',
        display: 'block',
        height: '110px',
        width: '110px',
        bottom:5,
        top:5,
        left:5,
        right:5,
        margin: 10,
        padding: 20,
        backgroundColor: mainStyle.panelBackgroundColor,
        textAlign: 'center',
        fontVariant: 'small-caps',
        textTransform: 'uppercase',
        fontSize: '0.8em',
        cursor: 'pointer',
        userSelect:'none',
        ':hover': {
          backgroundColor: mainStyle.menuBackgroundColor
        }
    }
}

const mapStateToProps = (state) => {
    return {
        menuVisible : state._menuVisible,
    }
}

class Menu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            places: [],
        };

        this.getConfig=this.getConfig.bind(this);
        this.placeLoad=this.placeLoad.bind(this);
    }

    async componentDidMount() {

        this.getConfig();
    }

    async getConfig(){

        fetch("/places/getPlaces")
        .then(response => response.json())
        .then(data => this.setState({ places: data }))
    }

    placeLoad(place) {

        console.log(place)

        if (place.type === "3d"){
            console.log("Showing 3d view : " + place.scene)
            this.props.dispatch(setValue("_scene", place.scene));
        }

        else if (place.type === "detail"){
            console.log("Showing 2d view : " + place.scene)
            this.props.dispatch(setValue("_view", place.name));
        }

        else if (place.type === "frame"){
            console.log("Showing iframe view : " + place.name)
            this.props.dispatch(setValue("_frame", place.url));
        }

        this.props.dispatch(setValue("_menuVisible", false));
    }

    render() {

        const me = this;
        const places = this.state.places;

        if (this.props.menuVisible == true) {
            return (
                <div style={layoutStyle}>

                    {places && Array.isArray(places) && places.map(function(place){

                        console.log(place)

                        return (

                            <div style={placesStyle.cellStyle} onClick={() => me.placeLoad(place)}>
                                <div style={placesStyle.cellContent} key={place.name} >
                                    <img src={"/assets/icons/"+ place.icon } width="64" height="64" />
                                    <div style={placesStyle.place}>{place.name}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )

        } else {

            return (null);
        }
    }
}

Menu = Radium(Menu);
export default connect(mapStateToProps)(Menu);
