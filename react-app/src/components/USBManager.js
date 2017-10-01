import React, { Component } from 'react';
import './Card.css';

class USBManager extends Component {
	render() {
		const childProcess = require('child_process');
		console.log(childProcess.execSync(`ls`).toString());
		return (
			<div className="card">
				USB Android Devices
				<button>掃描</button>
				<ul>
				</ul>
			</div>
		);
	}
}

export default USBManager;