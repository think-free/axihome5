import Head from 'next/head'
import { connect } from 'react-redux';
import { ReactReduxContext } from 'react-redux'
import { setValue } from '../redux/store.js'

class Mqtt extends React.Component {

    constructor(props) {
        super(props);

        this.values = {};

        this.messageProcessor=this.messageProcessor.bind(this);
    }

    async componentDidMount() {

        var me = this;
         
        // Create Mqtt client
        var client = mqtt.connect(this.props.url)
        client.subscribe(this.props.topic)
        client.on("message", me.messageProcessor)

        // Subscribe store changes
        if (this.props.subscribeCmd === true) {

            console.log("Subscribing store for write request")
            
            me.context.store.subscribe(function(){

                let states = me.context.store.getState()
    
                for (var i = 0; i < states.length; i++) { 

                    let k = states[i].variable;
                    let v = states[i].value;

                    if (k[0] !== "@") {

                        if (me.values[k] != v) {
    
                            var topic = me.props.cmdTopicStart + k.split(".").join("/") + me.props.cmdTopicEnd
                            console.log("Writting to : " + topic + " -> " + v )
                            client.publish(topic, v);
                        }
                    }
                }
            });
        }
    }

    messageProcessor (topic, payload) {

        
        var variable = topic.split(this.props.replace).join("");
        variable = variable.split("/").join(".");

        if (this.values[variable] !== payload ){
            this.values[variable] = payload;
            this.props.dispatch(setValue(variable, payload));
        }
    }

    render() {

        return (
            <div>
                <Head>
                    <script src="/static/mqtt/mqtt.min.js"></script> {/*https://github.com/mqttjs/MQTT.js*/}
                </Head>   
            </div>
        )
    }
}

Mqtt.contextType = ReactReduxContext; 

export default connect()(Mqtt)
