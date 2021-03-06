
let mainStyle = {
    mainBackgroundColor : "#1F1F27",
    panelBackgroundColor : "#292933",
    menuBackgroundColor : "#40414F",
    headerBackgroundColor : "#111111",

    border : "2px solid #383846",
    borderAlternative : "1px solid #22ADF6",

    textColor : "#A4A8B6",
    textDarkerColor : "#757888",
    textLighterColor : "#BEC2CC",
    textItemColor : "#22ADF6",

    interactable: "#FE6951",

    menuWidth: 50,
    headerHeight: 50,

    icon: "#999DAB",

    menuIcon : {
        marginTop: 10,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        borderRadius: "50%",
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
}

export default mainStyle
