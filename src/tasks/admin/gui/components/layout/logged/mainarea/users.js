import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../../redux/store.js'

import mainStyle from '../../../../styles/global.js'

/* Devices */

const usersStyle = {

    p100 : {
        height: '100%',
        display:'block'
    },
    toolBar : {
        position: 'relative',
        float: 'right'
    },
    usersList : {
        display:'block',
        position: 'relative',
        marginTop: 50,
        height: 'calc(100% - 30px)',
        width: '100%',
        fallbacks: [
            { height: '-moz-calc(100% - 50px)' },
            { height: '-webkit-calc(100% - 50px)' },
            { height: '-o-calc(100% - 50px)' }
        ],
        overflowY: 'auto'
    },
    panel : {
        color: mainStyle.textColor,
        marginTop: 10,
        minHeight: 40,
        padding: 10,
        width: "calc(100% - 30px)",
        backgroundColor: mainStyle.panelBackgroundColor
    },
    user : {
        color: mainStyle.textItemColor
    },
    value : {
        position: 'absolute',
        paddingLeft: 10,
        paddingRight: 10,
        marginTop: 5,
        backgroundColor: mainStyle.mainBackgroundColor,
    },
    menuIcon : {
        float: 'right'
    }
}

const mapStateToProps = (state) => {
    return {
    }
}

class Users extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            users: [],
            currentFilter: "",
            user : "",
            password : ""
        };

        this.currentFilterChanged=this.currentFilterChanged.bind(this);
        this.userChanged=this.userChanged.bind(this);
        this.passwordChanged=this.passwordChanged.bind(this);
    }

    async componentDidMount() {

        this.getData();

        // Periodicaly refresh states
        this.interval = setInterval(() => {
            this.getData();
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async getData(url){
        var url = "/core/getUsers"

        fetch(url)
        .then(response => response.json())
        .then(data => this.setState({ users: data }))
    }

    currentFilterChanged(event) {

        this.setState({ currentFilter: event.target.value })
    }

    userChanged (event) {

        this.setState({ user: event.target.value })
    }

    passwordChanged (event) {

        this.setState({ password: event.target.value })
    }

    addUser (key) {

        fetch("/core/addUser", {
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

    deleteUser (key) {
        fetch("/core/deleteUser?name=" + key)
    }

    // Render
    render() {
        const { users } = this.state;
        let { currentFilter } = this.state;
        if (currentFilter == "")
            currentFilter = ".*"

        const me = this;

        return (
            <div style={usersStyle.p100}>
                <span style={usersStyle.toolBar}>
                    <input key="filter" style={mainStyle.inputStyle} type="text" value={this.state.currentFilter} onChange={this.currentFilterChanged} onBlur={this.currentFilterChanged}/>
                </span>
                <div style={usersStyle.usersList}>
                    {users && users.map(function(user){

                        if (user.user.match("^" + currentFilter)){

                            return (
                                <div style={usersStyle.panel}>
                                    <span style={usersStyle.menuIcon}>
                                        <img key={"bt_delete_" + user.user} style={mainStyle.menuIcon} src="/admin/static/delete.png" alt="devices" width="20" height="20" draggable="false" onClick={() => me.deleteUser(user.user)}/>
                                    </span>
                                    <div style={usersStyle.user}>{user.user}</div>
                                </div>
                            )

                        } else {

                            return(null)
                        }
                    })}
                </div>

                <div>
                    User : <input key="user" style={mainStyle.inputStyle} type="text" value={this.state.user} onChange={this.userChanged} onBlur={this.userChanged}/>&nbsp;
                    Password : <input key="password" style={mainStyle.inputStyle} type="text" value={this.state.password} onChange={this.passwordChanged} onBlur={this.passwordChanged}/>&nbsp;
                    <img key={"bt_add"} style={mainStyle.menuIcon} src="/admin/static/add.png" alt="add" width="15" height="15" draggable="false" onClick={() => me.addUser()}/>
                </div>
            </div>
        )
    }
}

/* Export */

Users = Radium(Users);
export default connect(mapStateToProps)(Users);
