import { func } from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';
import { FaClipboard } from 'react-icons/fa';

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
        console.log(hash());
        var code = alpha + hash();
        console.log(code);
        this.state = {
            userName: '',
            roomHash: code,
            copySuccess: false
        }
    }

    setName(e) {
        this.setState({ userName: e.target.value });
    }

    setRoom(e) {
        this.setState({ roomHash: e.target.value });
    }

    copyCodeToClipboard() {
        document.getElementById('roomCodeInput').select();
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
                    <div>
                        <input placeholder="Room code" className="joinInput" type="text" onChange={this.setRoom.bind(this)}></input>
                    </div>
                    <input id='roomCodeInput' className="joinInput" type="text" value={this.state.roomHash}/>
                    <button className={'buttonClipboard mt-20'} onClick={this.copyCodeToClipboard.bind(this)}><FaClipboard></FaClipboard></button>
                    {
                        this.state.copySuccess ? 
                        <div style={{"color": 'white'}}>Copied!</div>
                        : null
                    }
                    <Link onClick={e => (!this.state.userName) ? e.preventDefault() : null} to={`/whiteboard?username=${this.state.userName}&room=${this.state.roomHash}`}>
                        <button className={'button mt-20'} type="submit">Create new whiteboard</button>
                    </Link>
                    <Link onClick={e => (!this.state.userName || !this.state.roomHash) ? e.preventDefault() : null} to={`/whiteboard?username=${this.state.userName}&room=${this.state.roomHash}`}>
                        <button className={'button mt-20'} type="submit">Join whiteboard</button>
                    </Link>
                </div>
            </div>
        );
    }
}
export default NewWhiteboard;