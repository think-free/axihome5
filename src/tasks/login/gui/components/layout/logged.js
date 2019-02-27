import Link from 'next/link'
import fetch from 'isomorphic-unfetch'

class Logged extends React.Component {

    render() {

        var currentUrl = window.location.href;
        var arr = currentUrl.split("/");
        var url = arr[0] + "//" + arr[2] + "/admin"
        window.location.href = url;

        return ( <div>
                    Redirecting ...
                </div>
	)
    }
}

export default Logged