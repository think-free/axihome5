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
    borderBottom: mainStyle.headerBorder, //Alternative
}

const logoStyle = {
    margin: "auto",
    position: "absolute",
    top: 15,
    left: 15,
}

const style = {

    toolBar : {
        position: 'relative',
        float: 'right',
        top: 5
    }
}

const mapStateToProps = (state) => {
    return {
        currentTab: state.currentTab,
        user: state.user,
        menuVisible : state._menuVisible,
    }
}

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.logout=this.logout.bind(this);
        this.toggleMenu=this.toggleMenu.bind(this);
    }

    logout(e) {
        fetch("/core/logout")
    }

    toggleMenu(e) {

        if (this.props.menuVisible == true) {

            console.log("Hidding menu")

            this.props.dispatch(setValue("_menuVisible", false));

        } else {

            console.log("Showing menu")

            this.props.dispatch(setValue("_menuVisible", true));
        }        
    }

    render() {

        return (
          <div style={layoutStyle}>
            <img style={logoStyle} src="/admin/static/ax5.png" width="75" height="75" draggable="false" onClick={this.toggleMenu}/>
            <span style={style.toolBar}>
                <img key="bt_exit" style={mainStyle.menuIcon} src="/admin/static/logout.png" width="20" height="20" draggable="false" onClick={this.logout}/>
            </span>
          </div>
        );
    }
}

Header = Radium(Header);
export default connect(mapStateToProps)(Header);
