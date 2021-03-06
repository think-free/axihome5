import Link from 'next/link'
import fetch from 'isomorphic-unfetch'

import mainStyle from '../../styles/global.js'

const htmlStyle = {
    backgroundColor: mainStyle.mainBackgroundColor,
    color: mainStyle.textColor
}

class Logged extends React.Component {

    getAllUrlParams(url) {

        // get query string from url (optional) or window
        var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
      
        // we'll store the parameters here
        var obj = {};
      
        // if query string exists
        if (queryString) {
      
          // stuff after # is not part of query string, so get rid of it
          queryString = queryString.split('#')[0];
      
          // split our query string into its component parts
          var arr = queryString.split('&');
      
          for (var i = 0; i < arr.length; i++) {
            // separate the keys and the values
            var a = arr[i].split('=');
      
            // set parameter name and value (use 'true' if empty)
            var paramName = a[0];
            var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
      
            // (optional) keep case consistent
            paramName = paramName.toLowerCase();
            if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
      
            // if the paramName ends with square brackets, e.g. colors[] or colors[2]
            if (paramName.match(/\[(\d+)?\]$/)) {
      
              // create key if it doesn't exist
              var key = paramName.replace(/\[(\d+)?\]/, '');
              if (!obj[key]) obj[key] = [];
      
              // if it's an indexed array e.g. colors[2]
              if (paramName.match(/\[\d+\]$/)) {
                // get the index value and add the entry at the appropriate position
                var index = /\[(\d+)\]/.exec(paramName)[1];
                obj[key][index] = paramValue;
              } else {
                // otherwise add the value to the end of the array
                obj[key].push(paramValue);
              }
            } else {
              // we're dealing with a string
              if (!obj[paramName]) {
                // if it doesn't exist, create property
                obj[paramName] = paramValue;
              } else if (obj[paramName] && typeof obj[paramName] === 'string'){
                // if property does exist and it's a string, convert it to an array
                obj[paramName] = [obj[paramName]];
                obj[paramName].push(paramValue);
              } else {
                // otherwise add the property
                obj[paramName].push(paramValue);
              }
            }
          }
        }
      
        return obj;
      }

    render() {

        var redirect = this.getAllUrlParams().redirect

        var currentUrl = window.location.href;
        var arr = currentUrl.split("/");
        var url = arr[0] + "//" + arr[2] + "/"
        if (redirect !== undefined) {
          url = url + redirect
        }
        window.location.href = url;

        return ( <div style={htmlStyle}>
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
                    Redirecting ...
                </div>
	)
    }
}



export default Logged