import Link from 'next/link'
import fetch from 'isomorphic-unfetch'
import Radium, {StyleRoot} from 'radium';
import { connect } from 'react-redux';

import Mqtt from '../provider/mqtt.js'

import Header from './logged/header.js'
import ThreeJSArea from './logged/threejsarea.js'
import PlaceHolder from './logged/placeholder.js'

import mainStyle from '../../styles/global.js'

const htmlStyle = {
    backgroundColor: mainStyle.mainBackgroundColor
}

const layoutStyle = {
    display: 'block',
    position: 'fixed',
    height: 'auto',
    bottom:0,
    top:0,
    left:0,
    right:0,
    color: mainStyle.textColor,
    backgroundColor: mainStyle.mainBackgroundColor
}

class Logged extends React.Component {

    constructor(props) {
        super(props);
    }

    async componentDidMount() {

        document.title = "Axihome 5"
        document.body.style = 'background: #1F1F27;';
    }

    render() {
        
        return (
            <StyleRoot>
                <div style={htmlStyle}>
                    <style global jsx>{`
                    html,
                    body,
                    body > div:first-child,
                    div#__next,
                    div#__next > div,
                    div#__next > div > div {
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        overflow: hidden;
                    }
                    `}</style>

                    <div style={layoutStyle}>
                        
                        <Mqtt topic={"axihome/5/status/#"} subscribeCmd={true} cmdTopicStart={"axihome/5/status/"} cmdTopicEnd={"/cmd"} replace={"axihome/5/status/"}/>

                        <Header />
                        <ThreeJSArea url={"/assets/scene.json"} />

                        <PlaceHolder />
                        
                    </div>
                </div>
            </StyleRoot>
        )
    }
}

Logged = Radium(Logged);
Logged = connect()(Logged)

export default connect()(Logged)

// http://172.16.10.110:8080/places/getPlaces
// http://172.16.10.110:8080/core/getDevices
