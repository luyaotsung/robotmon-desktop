import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel, Col, FormGroup, FormControl, Button } from 'react-bootstrap';
import _ from 'lodash';
import fs from 'fs';
import electron from 'electron';

import {} from '../styles/global.css';

export default class Screen extends Component {
  constructor(props) {
    super(props);
    // this.props = props;

    this.state = {
    };


    this.onSyncScreenClick = this.onSyncScreenClick.bind(this);
  }

  static get propTypes() {
    return {
      ip: PropTypes.string.isRequired,
      editorClient: PropTypes.object.isRequired,
    };
  }

  // componentWillUpdate(nextProps) {}

  updateEditorClient() {

  }


  onSyncScreenClick() {
    if (this.props.editorClient.isSyncScreen) {
      this.props.editorClient.isSyncScreen = false;
    } else {
      this.props.editorClient.isSyncScreen = true;
    }
    this.forceUpdate();
  }

  render() {
    return (
      <div>
        <Panel header="Screen Controller">
          <FormGroup>
            <Button onClick={this.onSyncScreenClick}>
              {this.props.editorClient.isSyncScreen ? 'Sync On' : 'Sync Off'}
            </Button>
          </FormGroup>
        </Panel>
      </div>
    );
  }
}
