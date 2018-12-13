import React from 'react'
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
    backgroundColor: mainStyle.headerBackgroundColor,
    borderBottom: mainStyle.borderAlternative
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

const mapStateToProps = (state) => {
    return {
        currentTab: state.currentTab
    }
}

class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        };

        this.buttonClick=this.buttonClick.bind(this);
    }

    buttonClick(e) {
        this.props.dispatch(setValue("Header", "clicked"));
    }

    render() {

        const currentTab = this.props.currentTab

        return (
          <div style={layoutStyle}>
            <img style={logoStyle} src="/admin/static/ax5.png" width="75" height="75" draggable="false"/>
            <div style={pageTitleStyle}>
                {currentTab}
            </div>
          </div>
        );
    }
}

export default connect(mapStateToProps)(Header);
