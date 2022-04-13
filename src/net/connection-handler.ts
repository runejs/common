import { Socket } from 'net';
import { ConnectionStatus } from './connection-status';
import { SocketServer } from './socket-server';


export class ConnectionHandler<T = undefined> {

    readonly server: SocketServer;
    readonly socket: Socket;

    protected _connectionStatus: ConnectionStatus | T = ConnectionStatus.HANDSHAKE;

    constructor(server: SocketServer, socket: Socket) {
        this.server = server;
        this.socket = socket;
    }

}
