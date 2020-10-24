import { openServer, SocketConnectionHandler, logger, setLoggerDateFormat, ByteBuffer } from './index';
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
    setLoggerDateFormat('HH:mm:ss');
    openServer('Test Server', '0.0.0.0', 43586, socket => new TestConnectionHandler(socket));
}

launchTestServer();
