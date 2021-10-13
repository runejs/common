import { createServer, Server, Socket } from 'net';
import { ByteBuffer } from '../buffer';
import { logger } from '../logger';
import { ConnectionStatus } from './connection-status';
import { setObjectProps } from '../util';


export class SocketServerOptions {

    public handshakeRequired: boolean = true;
    public noDelay: boolean = true;
    public keepAlive: boolean = true;
    public timeout: number = 30000;

    public constructor(props?: Partial<SocketServerOptions>) {
        setObjectProps<SocketServerOptions>(this, props);
    }

}


export abstract class SocketServer<T = undefined> {

    public readonly socket: Socket;
    public readonly options: SocketServerOptions;

    protected _connectionStatus: ConnectionStatus | T = ConnectionStatus.HANDSHAKE;

    public constructor(socket: Socket);
    public constructor(socket: Socket, options: Partial<SocketServerOptions>);
    public constructor(socket: Socket, options: SocketServerOptions);
    public constructor(socket: Socket, options: Partial<SocketServerOptions> | SocketServerOptions | undefined);
    public constructor(socket: Socket, options?: Partial<SocketServerOptions> | SocketServerOptions | undefined) {
        this.socket = socket;
        this.options = new SocketServerOptions(options);

        socket.setNoDelay(this.options.noDelay);
        socket.setKeepAlive(this.options.keepAlive);
        socket.setTimeout(this.options.timeout);

        if(!this.options.handshakeRequired) {
            this._connectionStatus = ConnectionStatus.ACTIVE;
        }

        socket.on('data', data => {
            try {
                this.dataReceived(data);
            } catch(e) {
                this.error(e);
            }
        });

        socket.on('close', hadError => {
            if(hadError) {
                this.error(new Error('Socket closed unexpectedly!'));
            } else {
                this.closeConnection();
            }
        });

        socket.on('error', error => this.error(error));
    }

    public static launch<T extends SocketServer<any>>(
        serverName: string,
        hostName: string,
        port: number,
        socketServerFactory: (socket: Socket) => T
    ): Server {
        const server = createServer(socket => {
            socketServerFactory(socket);
        }).listen(port, hostName);

        logger.info(`${ serverName } listening @ ${ hostName }:${ port }.`);
        return server;
    }

    public dataReceived(data: Buffer): void {
        if(!data) {
            return;
        }

        const byteBuffer = ByteBuffer.fromNodeBuffer(data);

        if(this.options.handshakeRequired && this.connectionStatus === ConnectionStatus.HANDSHAKE) {
            if(this.initialHandshake(byteBuffer)) {
                this._connectionStatus = ConnectionStatus.ACTIVE;
            } else {
                logger.warn(`Initial client handshake failed.`);
            }
        } else {
            this.decodeMessage(byteBuffer);
        }
    }

    public closeConnection(): void {
        this._connectionStatus = ConnectionStatus.CLOSED;
        if(this.socket?.writable && !this.socket.destroyed) {
            this.socket.destroy();
        }

        this.connectionDestroyed();
    }

    public error(error: Error): void;
    public error(error: { message?: string }): void;
    public error(error: string): void;
    public error(error: any | Error | { message?: string } | string): void;
    public error(error: any | Error | { message?: string } | string): void {
        if(error && typeof error === 'string') {
            error = { message: error };
        }

        logger.error('Socket destroyed due to error' + error?.message ? `: ${error.message}` : '.');

        try {
            this.closeConnection();
        } catch(closeConnectionError) {
            logger.error('Error closing server connection' +
            closeConnectionError?.message ? `: ${closeConnectionError.message}` : '.');
        }
    }

    abstract initialHandshake(data: ByteBuffer): boolean;
    abstract decodeMessage(data: ByteBuffer): void | Promise<void>;
    abstract connectionDestroyed(): void;

    public get connectionStatus(): ConnectionStatus | T {
        return this._connectionStatus;
    }

    public get connectionAlive(): boolean {
        return this.socket?.writable && !this.socket.destroyed;
    }

}
