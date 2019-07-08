import React from 'react'
import Radium from 'radium';
import Iframe from 'react-iframe'
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

const style = {

    toolBar : {
        position: 'relative',
        float: 'right',
        top: 5,
        right: 5
    },
    content : {
        display: 'block',
        position: 'relative',
        height: 'calc(100% - 100px)',
        width: 'auto',
        top: 60,
        left: 30,
        right: 20,
        bottom: 20,
        overflowY: 'hidden',
        fallbacks: [
            { height: '-moz-calc(100% - 100px)' },
            { height: '-webkit-calc(100% - 100px)' },
            { height: '-o-calc(100% - 100px)' }
        ]
    }
}

const iframeStyle = {
    border: "0px solid #999dab"
}

const mapStateToProps = (state) => {
    return {
        frame : state._frame,
    }
}

class Frame extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        };

        this.close=this.close.bind(this);
    }

    close(e) {
        this.props.dispatch(setValue("_frame", ""));
    }
    
    render() {

        if (this.props.frame != undefined && this.props.frame != "") {
            return (
                <div style={layoutStyle}>
                   <span style={style.toolBar}>
                        <img key="bt_exit" style={mainStyle.menuIcon} src="/static/close.png" width="25" height="25" draggable="false" onClick={this.close}/>
                    </span>
                    <div style={style.content}>
                        <Iframe url={this.props.frame}
                            width="99%"
                            height="99%"
                            id="apllicationFrame"
                            className="myClassname"
                            display="initial"
                            position="relative"
                            allowFullScreen
                            frameBorder="0"
                            name="mainAreaFrame"
                            styles={iframeStyle} />
                    </div>
                </div>
            );
        } else {

            return (null);
        }
    }
}

Frame.defaultProps = {
    frame: ""
};

Frame = Radium(Frame);
export default connect(mapStateToProps)(Frame);
