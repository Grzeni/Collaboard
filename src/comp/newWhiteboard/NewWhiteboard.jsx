import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';
import { FaClipboard } from 'react-icons/fa';
import queryString from 'query-string';


class NewWhiteboard extends React.Component {
    constructor(props) {
        super(props);
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let alpha = Date.now().toString();
        function hash() {
            let password = '';
            for (let i = 0; i < alpha.length; i++) {
                password += chars.charAt(
                    Math.floor(Math.random() * chars.length)
                );
            };
            return password;
        }
        var code = alpha + hash();
        console.log('querystring parameters', queryString.parse(window.location.search));
        this.state = {
            userName: '',
            roomHash: code,
            copySuccess: false,
            invitedToRoom: queryString.parse(window.location.search)
        }
    }

    setName(e) {
        this.setState({ userName: e.target.value });
    }

    copyCodeToClipboard() {
        document.getElementById('shareLinkInput').select();
        document.execCommand("copy");
        this.setState({ copySuccess: true });
    }



    render() {
        return (
            <div className="joinOuterContainer">
                <div className="joinInnerContainer">
                    <h1 className="heading">Collaboard</h1>
                    <div>
                        <input placeholder="Username" className="joinInput" type="text" onChange={this.setName.bind(this)} />
                    </div>
                    {
                        (this.state.invitedToRoom.room) ?
                            "" : <div>
                                <input id='shareLinkInput'
                                    className="shareLinkInput"
                                    type="text"
                                    readOnly value={`localhost:3000/invite?room=${this.state.roomHash}`}>
                                </input>
                                <button className={'buttonClipboard mt-20'} onClick={this.copyCodeToClipboard.bind(this)}><FaClipboard></FaClipboard></button>
                            </div>
                    }
                    <Link onClick={e => (!this.state.userName) ? e.preventDefault() : null} to={`/session?room=${this.state.invitedToRoom.room ? this.state.invitedToRoom.room : this.state.roomHash}&username=${this.state.userName}`}>
                        <button className={'button mt-20'} type="submit">{this.state.invitedToRoom.room ? `Join whiteboard` : `Create whiteboard`}</button>
                    </Link>
                </div>
            </div>
        );
    }
}
export default NewWhiteboard;