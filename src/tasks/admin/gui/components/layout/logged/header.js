import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../redux/store.js'

import mainStyle from '../../../styles/global.js'

const layoutStyle = {
    display: 'block',
    position: 'fixed',
    height: mainStyle.headerHeight,
    width: 'auto',
    top:0,
    left:0,
    right:0,
    color: mainStyle.textColor,
    backgroundColor: mainStyle.header,
    borderBottom: mainStyle.headerBorder //Alternative
}

const logoStyle = {
    margin: "auto",
    position: "absolute",
    top: 15,
    left: 15
}

const pageTitleStyle = {
    color: mainStyle.textDarkerColor,
    fontSize: 20,
    margin: "auto",
    position: "absolute",
    top: 15,
    left: 100,
    bottom: 0,
    right: 0
}

const userStyle = {
    color: mainStyle.textDarkerColor,
    fontSize: 20,
    margin: "auto",
    position: "absolute",
    top: 15,
    right: 100,
    bottom: 0,
    right: 0
}

const style = {

    toolBar : {
        position: 'relative',
        float: 'right'
    }
}

const mapStateToProps = (state) => {
    return {
        currentTab: state.currentTab,
        user: state.user
    }
}

class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user : ""
        };

        this.logout=this.logout.bind(this);
    }

    logout(e) {
        fetch("/core/logout")
    }

    render() {

        const currentTab = this.props.user
        const user = this.state

        return (
          <div style={layoutStyle}>
            <img style={logoStyle} src="/admin/static/ax5.png" width="75" height="75" draggable="false"/>
            <div style={pageTitleStyle}>
                <span>{currentTab}</span>
            </div>
            <span style={style.toolBar}>
                {user}
                <img key="bt_exit" style={mainStyle.menuIcon} src="/admin/static/logout.png" width="20" height="20" draggable="false" onClick={this.logout}/>
            </span>
          </div>
        );
    }
}

Header = Radium(Header);
export default connect(mapStateToProps)(Header);
