import { createServer, Socket } from 'net';
import { ByteBuffer } from '../buffer';
import { logger } from '../logger';
import { ConnectionStatus } from './connection-status';


export abstract class SocketServer<T = undefined> {

    public readonly socket: Socket;

    protected _connectionStatus: ConnectionStatus | T = ConnectionStatus.HANDSHAKE;

    public constructor(socket: Socket) {
        this.socket = socket;

        socket.setNoDelay(true);
        socket.setKeepAlive(true);
        socket.setTimeout(30000);

        socket.on('data', data => {
            logger.info(`Data received...`);
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
    ): void {
        createServer(socket => {
            socketServerFactory(socket);
        }).listen(port, hostName);

        logger.info(`${ serverName } listening @ ${ hostName }:${ port }.`);
    }

    public dataReceived(data: Buffer): void {
        if(!data) {
            logger.warn(`No data received.`);
            return;
        }

        const byteBuffer = ByteBuffer.fromNodeBuffer(data);

        if(this.connectionStatus === ConnectionStatus.HANDSHAKE) {
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

    public error(error: any): void {
        logger.error('Socket destroyed due to error:');
        logger.error(error);

        try {
            this.closeConnection();
        } catch(closeConnectionError) {
            logger.error(`Error closing server connection:`);
            logger.error(closeConnectionError);
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
