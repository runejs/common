import { SocketServer, ConnectionHandler } from './net';
import { ByteBuffer } from './buffer';
import { logger } from './logger';
import { Socket } from 'net';
import { RGB } from './color';


class TestConnectionHandler extends ConnectionHandler {

    decodeMessage(data: ByteBuffer): void {
        logger.info(`Data received:`, data.get('string'));
        logger.info(data.get('long').toString());
    }

    initialHandshake(data: ByteBuffer): boolean {
        logger.info(`Initial handshake:`, data.get('string'));
        logger.info(data.get('long').toString());
        return true;
    }

    connectionDestroyed(): void {
        logger.info(`Connection destroyed.`);
    }

}


function launchTestServer() {
    logger.info('Starting server...');

    const TEST_PORT = 8000;

    const server = new SocketServer({
        timeout: 300,
        keepAlive: false,
        handshakeRequired: false
    });

    server.start('Test Server', '0.0.0.0', TEST_PORT, socket =>
        new TestConnectionHandler(server, socket));

    const speakySocket = new Socket();
    speakySocket.connect(TEST_PORT);

    setTimeout(() => {
        const buffer = new ByteBuffer(200);
        buffer.put('hi', 'string');
        buffer.put(BigInt('12345'), 'long');
        speakySocket.write(buffer.flipWriter());
    }, 1000);

    setTimeout(() => {
        const buffer = new ByteBuffer(200);
        buffer.put('how are you?', 'string');
        buffer.put(BigInt('67890'), 'long');
        speakySocket.write(buffer.flipWriter());
    }, 2000);

    setTimeout(() => speakySocket.destroy(), 3000);
    setTimeout(() => server.stop(), 4000);
}

launchTestServer();

const whatisthiscolor = new RGB(16711935);
console.log(whatisthiscolor);
