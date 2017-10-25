import fp from 'func-pipe';

import ServiceClient from '../modules/service-client';
import { CEditorEB } from '../modules/event-bus';

import {} from '../styles/global.css';

export default class EditorClient {
  constructor(ip) {
    this.ip = ip;
    this.isConnect = false;
    this.connectState = 'connecting...';

    // sync screen
    this.isSyncScreen = false;

    this.client = new ServiceClient(ip);
    this.client.init();
    this.testConnection();
  }

  testConnection() {
    fp
      .pipe(fp.bindObj(this.client.runScript, this.client, 'console.log("Robotmon Desktop Connect");'))
      .pipe(() => {
        this.isConnect = true;
        this.connectState = 'connected';
      })
      .catch(() => {
        this.isConnect = false;
        this.connectState = 'disconnect';
      })
      .pipe(() => CEditorEB.emit(CEditorEB.EventClientChanged, this.ip));
  }
}
