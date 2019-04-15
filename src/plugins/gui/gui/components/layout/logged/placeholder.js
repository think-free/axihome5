import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../redux/store.js'

import Dimmer from './widgets/dimmer.js'

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

        };

        this.close=this.close.bind(this);
    }

    close(e) {
        this.props.dispatch(setValue("_view", ""));
    }

    render() {

        if (this.props.view != undefined && this.props.view != "") {
            return (
                <div style={layoutStyle}>
                   <span style={style.toolBar}>
                        <img key="bt_exit" style={mainStyle.menuIcon} src="/static/close.png" width="25" height="25" draggable="false" onClick={this.close}/>
                    </span>
                    <Dimmer />
                </div>
            );
        } else {

            return (null);
        }
    }
}

PlaceHolder = Radium(PlaceHolder);
export default connect(mapStateToProps)(PlaceHolder);
