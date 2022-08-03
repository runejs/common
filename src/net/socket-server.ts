import { createServer, Server, Socket } from 'net';
import { logger } from '../logger';
import { setObjectProps } from '../util';
import { ConnectionHandler } from './connection-handler';


export class SocketServerOptions {

    handshakeRequired: boolean = true;
    noDelay: boolean = true;
    keepAlive: boolean = true;
    timeout: number = 30000;

    constructor(props?: Partial<SocketServerOptions>) {
        setObjectProps<SocketServerOptions>(this, props);
    }

}


export class SocketServer {

    readonly options: SocketServerOptions;

    private _server: Server;
    private _connections: ConnectionHandler[] = [];

    constructor(options?: Partial<SocketServerOptions> | SocketServerOptions | undefined) {
        this.options = new SocketServerOptions(options);
    }

    removeConnection(connectionHandler: ConnectionHandler<any>): void {
        const idx = this._connections.indexOf(connectionHandler);
        if (idx !== -1) {
            this._connections.splice(idx, 1);
        }
    }

    start(
        serverName: string,
        hostName: string,
        port: number,
        connectionHandlerFactory: (socket: Socket) => ConnectionHandler
    ): Server {
        this._server = createServer(socket => {
            const connectionHandler = connectionHandlerFactory(socket);
            this._connections.push(connectionHandler);
        }).listen(port, hostName);

        logger.info(`${ serverName } listening @ ${ hostName }:${ port }.`);
        return this._server;
    }

    stop(): void {
        this.server.close();
    }

    get server(): Server {
        return this._server;
    }

    get connections(): ConnectionHandler[] {
        return this._connections;
    }

}
