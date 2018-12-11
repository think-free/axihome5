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

const mapStateToProps = (state) => {
    return {
        Header: state.Header
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
        return (
          <div style={layoutStyle}>

          </div>
        );
    }
}

export default connect(mapStateToProps)(Header);
