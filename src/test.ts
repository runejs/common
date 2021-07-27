import { SocketServer } from './net';
import { ByteBuffer } from './buffer';
import { logger } from './index';
import { Socket } from 'net';


class TestConnectionHandler extends SocketServer {

    public decodeMessage(data: ByteBuffer): void {
        logger.info(`Data received:`, data.getString());
    }

    public initialHandshake(data: ByteBuffer): boolean {
        logger.info(`Initial handshake:`, data.getString());
        return true;
    }

    public connectionDestroyed(): void {
        logger.info(`Connection destroyed.`);
    }

}

function launchTestServer() {
    logger.info('Starting server...');

    SocketServer.launch('Test Server', '0.0.0.0', 43594, socket =>
        new TestConnectionHandler(socket));

    const speakySocket = new Socket();
    speakySocket.connect(43594);

    setTimeout(() => {
        const buffer = new ByteBuffer(200);
        buffer.put('hi', 'string');
        speakySocket.write(buffer.flipWriter());
    }, 3000);

    setTimeout(() => {
        const buffer = new ByteBuffer(200);
        buffer.put('how are you?', 'string');
        speakySocket.write(buffer.flipWriter());
    }, 6000);
}

launchTestServer();
