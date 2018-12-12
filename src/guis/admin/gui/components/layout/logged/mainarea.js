import React from 'react'
import { connect } from 'react-redux'
import { setValue } from '../../redux/store.js'
import Iframe from 'react-iframe'

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
        currentSection: state.currentSection
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

        const currentSection = this.props.currentSection

        if (currentSection != undefined) {

            var currentUrl = window.location.href;
            var arr = currentUrl.split("/");
            var url = arr[0] + "//" + arr[2] + "/" + currentSection.url;

            return (
              <div style={layoutStyle}>
                <Iframe url={url}
                    width="100%"
                    height="100%"
                    id="apllicationFrame"
                    className="myClassname"
                    display="initial"
                    position="relative"
                    allowFullScreen/>
              </div>
            );
        } else {
            return (null);
        }
    }
}

export default connect(mapStateToProps)(MainArea);
