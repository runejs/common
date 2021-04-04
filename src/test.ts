import { openServer, SocketConnectionHandler, logger, ByteBuffer } from './index';
import { Socket } from 'net';


class TestConnectionHandler extends SocketConnectionHandler {

    public constructor(private readonly socket: Socket) {
        super();
    }

    async dataReceived(data: ByteBuffer): Promise<void> {
        logger.info(`Data received:`, data);
    }

    connectionDestroyed(): void {
        logger.info(`Connection destroyed.`);
    }

}

function launchTestServer() {
    logger.info('Starting server...', { hello: 'world' });
    openServer('Test Server', '0.0.0.0', 43586, socket => new TestConnectionHandler(socket));
}

launchTestServer();
