import { Socket } from 'net';
import { openServer, SocketConnectionHandler } from './net';
import { ByteBuffer } from './buffer';
import { logger } from './logger';


class TestConnectionHandler extends SocketConnectionHandler {

    public constructor(private readonly socket: Socket) {
        super();
    }

    async dataReceived(data: ByteBuffer): Promise<void> {
        logger.info(`Data received:`, data.getString());
    }

    connectionDestroyed(): void {
        logger.info(`Connection destroyed.`);
    }

}

function launchTestServer() {
    logger.info('Starting server...', { hello: 'world' });
    openServer('Test Server', '0.0.0.0', 43594, socket => {
        const handler = new TestConnectionHandler(socket);
        const testMessage = 'hello world';
        const buffer = new ByteBuffer(20);
        buffer.putString(testMessage);

        setTimeout(() => socket.write(buffer.flipWriter()), 2000);

        return handler;
    });
}

launchTestServer();
