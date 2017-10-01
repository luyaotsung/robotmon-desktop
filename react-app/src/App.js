import React, { Component } from 'react';
import NavigationBar from './components/NavigationBar';
import USBManager from './components/USBManager';

class App extends Component {
  render() {
    const container = {'margin':'20px'}
    return (
      <div className="App">
        <NavigationBar />
        <div style={container}>
          <USBManager />
        </div>
      </div>
    );
  }
}

export default App;
