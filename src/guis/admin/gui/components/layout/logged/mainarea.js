import React from 'react'
import { connect } from 'react-redux'
import { setValue } from '../../redux/store.js'

import mainStyle from '../../../styles/global.js'

const layoutStyle = {
    display: 'block',
    position: 'fixed',
    height: 'auto',
    width: 'auto',
    top:mainStyle.headerHeight + 10,
    left:mainStyle.menuWidth + 10,
    bottom:10,
    right:10,
    color: mainStyle.textColor,
}

const mapStateToProps = (state) => {
    return {
        MainArea: state.MainArea
    }
}

class MainArea extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        };

        this.buttonClick=this.buttonClick.bind(this);
    }

    buttonClick(e) {
        this.props.dispatch(setValue("MainArea", "clicked"));
    }

    render() {
        return (
          <div style={layoutStyle}>
          </div>
        );
    }
}

export default connect(mapStateToProps)(MainArea);
