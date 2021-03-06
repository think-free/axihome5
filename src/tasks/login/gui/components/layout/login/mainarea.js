import React from 'react'
import Radium, {StyleRoot} from 'radium';
import fetch from 'isomorphic-unfetch';
import { connect } from 'react-redux'
import { setValue } from '../../redux/store.js'

import mainStyle from '../../../styles/global.js'

/* Devices */

const MainAreaStyle = {

    main : {
        display: 'block',
        position: 'fixed',
        height: '100%',
        width: '100%',
        top:mainStyle.headerHeight,
        left:0,
        bottom:0,
        color: mainStyle.textColor,
        backgroundColor: mainStyle.mainBackgroundColor
    },
    loginBox : {

        position: 'absolute',
        width: 300,
        height: 280,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        backgroundColor: mainStyle.panelBackgroundColor,
        border: mainStyle.border,

        '@media (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait), (min-resolution: 192dpi) and (orientation: portrait)': {

            zoom: 3
        }
    },
    loginInputs : {
        top: 100,
        padding: 20,
        justifyContent: 'center',
        textAlign: 'center'
    },
    image : {
        verticalAlign : 'middle'
    }
}

const mapStateToProps = (state) => {
    return {

    }
}

class MainArea extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loginInfo: {},
            user: "",
            password: ""
        };

        this.userChanged=this.userChanged.bind(this);
        this.passwordChanged=this.passwordChanged.bind(this);
        this.keyPressed=this.keyPressed.bind(this);
        this.enter=this.enter.bind(this);
    }

    userChanged(event) {

        this.state.user = event.target.value
        this.setState({ user: event.target.value })
    }

    passwordChanged(event) {

        this.state.password = event.target.value
        this.setState({ password: event.target.value })
    }

    keyPressed(e) {
        if (e.key === 'Enter') {
            this.enter()
        }
    }

    enter(){
        fetch("/core/login", {

            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user : this.state.user,
                password : this.state.password
            })
        })
    }

    // Render
    render() {

        const me = this;
        const { loginInfo } = this.state;

        return (
            <div style={MainAreaStyle.main}>
                <div style={MainAreaStyle.loginBox}>
                    <div style={MainAreaStyle.loginInputs}>
                        <br />
                        <img src="/login/static/ax5.png" width="75" height="75" draggable="false"/><br /><br /><br />
                        <span><img style={MainAreaStyle.image} src="/login/static/user.png" width="20" height="20" draggable="false"/> <input key="user" style={mainStyle.inputStyle} type="text" value={this.state.user} onChange={this.userChanged} onBlur={this.userChanged} onKeyPress={this.keyPressed}/></span> <br /><br />
                        <span><img style={MainAreaStyle.image} src="/login/static/password.png" width="20" height="20" draggable="false"/> <input key="password" style={mainStyle.inputStyle} type="password" value={this.state.password} onChange={this.passwordChanged} onBlur={this.passwordChanged} onKeyPress={this.keyPressed}/></span> <br />
                        <span><img style={mainStyle.menuIcon} src="/login/static/login.png" width="20" height="20" draggable="false" onClick={this.enter}/></span>
                    </div>
                </div>
            </div>
        )
    }
}


/* Export */

MainArea = Radium(MainArea);
export default connect(mapStateToProps)(MainArea);
