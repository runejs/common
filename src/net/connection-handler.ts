import { Socket } from 'net';
import { ConnectionStatus } from './connection-status';
import { SocketServer } from './socket-server';
import { logger } from '../logger';
import { ByteBuffer } from '../buffer';


export abstract class ConnectionHandler<S = undefined> {

    readonly socketServer: SocketServer;
    readonly socket: Socket;

    protected _connectionStatus: ConnectionStatus | S = ConnectionStatus.HANDSHAKE;

    constructor(socketServer: SocketServer, socket: Socket) {
        this.socketServer = socketServer;
        this.socket = socket;

        socket.setNoDelay(socketServer.options.noDelay);
        socket.setKeepAlive(socketServer.options.keepAlive);
        socket.setTimeout(socketServer.options.timeout);

        if (!socketServer.options.handshakeRequired) {
            this._connectionStatus = ConnectionStatus.ACTIVE;
        }

        socket.on('data', data => {
            try {
                this.dataReceived(data);
            } catch (e) {
                this.error(e);
            }
        });

        socket.on('close', hadError => {
            if (hadError) {
                this.error(new Error('Socket closed unexpectedly!'));
            } else {
                this.closeConnection();
            }
        });

        socket.on('error', error => this.error(error));
    }

    abstract initialHandshake(data: ByteBuffer): boolean;
    abstract decodeMessage(data: ByteBuffer): void | Promise<void>;
    abstract connectionDestroyed(): void;

    dataReceived(data: Buffer): void {
        if (!data) {
            return;
        }

        const byteBuffer = ByteBuffer.fromNodeBuffer(data);

        if (this.socketServer.options.handshakeRequired && 
            this.connectionStatus === ConnectionStatus.HANDSHAKE) {
            if (this.initialHandshake(byteBuffer)) {
                this._connectionStatus = ConnectionStatus.ACTIVE;
            } else {
                logger.warn(`Initial client handshake failed.`);
            }
        } else {
            this.decodeMessage(byteBuffer);
        }
    }

    closeConnection(): void {
        this._connectionStatus = ConnectionStatus.CLOSED;
        if (this.socket?.writable && !this.socket.destroyed) {
            this.socket.destroy();
        }

        this.socketServer.removeConnection(this);
        this.connectionDestroyed();
    }

    error(error: Error): void;
    error(error: { message?: string }): void;
    error(error: string): void;
    error(error: any | Error | { message?: string } | string): void;
    error(error: any | Error | { message?: string } | string): void {
        if (error && typeof error === 'string') {
            error = { message: error };
        }

        logger.error('Socket destroyed due to error' + error?.message ? `: ${error.message}` : '.');

        try {
            this.closeConnection();
        } catch (closeConnectionError) {
            logger.error('Error closing server connection' +
            closeConnectionError?.message ? `: ${closeConnectionError.message}` : '.');
        }
    }

    get connectionStatus(): ConnectionStatus | S {
        return this._connectionStatus;
    }

    get connectionAlive(): boolean {
        return this.socket?.writable && !this.socket.destroyed;
    }

}
