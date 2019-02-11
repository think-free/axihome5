
let mainStyle = {
    mainBackgroundColor : "#1F1F27",
    panelBackgroundColor : "#292933",
    menuBackgroundColor : "#40414F",
    headerBackgroundColor : "#111111",

    header : "#30303b",
    headerBorder : "1px solid #999dab",

    border : "2px solid #383846",
    borderAlternative : "1px solid #22ADF6",
    borderOrange : "1px solid #FE6951",

    textColor : "#A4A8B6",
    textDarkerColor : "#757888",
    textLighterColor : "#BEC2CC",
    textItemColor : "#22ADF6",

    interactable: "#FE6951",

    menuWidth: 50,
    headerHeight: 50,

    icon: "#22ADF6",

    menuIcon : {
        paddingTop: 10,
        paddingRight: 20,
        paddingBottom: 10,
        paddingLeft: 20,
        cursor: "pointer",
        ':hover': {
          backgroundColor: "#40414F"
        }
    },

    inputStyle : {
        borderRadius: 15,
        backgroundColor: "#40414F",
        border: "2px solid #383846",
        outline: "none",
        padding: 3,
        color : "#A4A8B6",
        ':focus' : {
            outline: "none",
            backgroundColor: "#383846",
            color : "#A4A8B6"
        }
    },

    line : {
        height: 1,
        width: 'calc(100%-100px)',
        marginLeft: 50,
        marginRight: 50,
        backgroundColor: '#383846'
    }
}

export default mainStyle
