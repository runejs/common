[![RuneJS Discord Server](https://img.shields.io/discord/678751302297059336?label=RuneJS%20Discord&logo=discord)](https://discord.gg/5P74nSh)

[![RuneJS](https://i.imgur.com/QSXNzwC.png)](https://github.com/runejs/)

# Common

Common logging, networking, compression, and other miscellaneous functionality for RuneJS.

## `@runejs/common`

### `logger`

_Also exported from `@runejs/common/logger`_

`logger` is exported as a singleton Pino logging wrapper that provides the following methods:

```typescript
logger.info  = (...messages: any[]): void;
logger.debug = (...messages: any[]): void;
logger.warn  = (...messages: any[]): void;
logger.error = (...messages: any[]): void;
logger.trace = (...messages: any[]): void;
logger.fatal = (...messages: any[]): void;

logger.setOptions = (
  options: Partial<pino.LoggerOptions>, 
  reInitialize: boolean = true
): void;

logger.setTargets = (
  targets: pino.TransportTargetOptions<Record<string, any>>[], 
  reInitialize: boolean = true
): void;

logger.setTarget = (
  target: string, 
  reInitialize: boolean = true
): void;
```

#### Logger Transports & Targets

In addition, several helper functions are exported separately for configuring basic logger transport targets:

```typescript
defaultTarget = (
  level: pino.LevelWithSilent = 'info'
) => pino.TransportTargetOptions<Record<string, any>>

prettyPrintTarget = (
  level: pino.LevelWithSilent = 'info'
) => pino.TransportTargetOptions<Record<string, any>>

fileTarget = (
  destination: string, 
  level: pino.LevelWithSilent = 'info'
) => pino.TransportTargetOptions<Record<string, any>>
```

#### Logger Target Configuration

An example configuration to set log output to pretty print and output to a local log file would look like so:

```typescript
import { 
  logger, prettyPrintTarget, fileTarget 
} from '@runejs/common';

logger.setTargets([
    prettyPrintTarget(), 
    fileTarget('./logs/latest.log')
]);
```

### `ByteBuffer`

_Also exported from `@runejs/common/buffer`_

`ByteBuffer` is a wrapper class extending  `Uint8Array` with additional utility functions.

* Unified configurable `get` and `put` methods to easily move bytes within the buffer.
* Supported data types: Bit, Byte, Short, Int24, Smart Short, Int, Smart Int, Long and String.
* Big endian, little endian, and mixed endian support.
* Bit access through `openBitBuffer()`, `putBits()`, and `closeBitBuffer()`

## `@runejs/common/color`
Handles various color conversions needed by the game and tooling.
* `RGB(A)`
* `HSL` (Hue, Saturation, Lightness)
* `HSV` (Hue, Saturation, Value/Brightness)
* `HCL` (Hue, Chroma, Luminance)
* `LAB` (Lightness, A, B)

## `@runejs/common/compress`
* Exported class `Gzip` handles Gzip compression and decompression.
* Exported class `Bzip2` handles Bzip2 compression and decompression.

## `@runejs/common/crc32`
Exports a single class `Crc32` that generates CRC32 checksums for binary data files.

## `@runejs/common/encrypt`
Provides XTEA encryption and decryption functionality, as well as a key file loader.
* Exported as class `Xtea`

## `@runejs/common/net`
* `SocketServer`
  * Handles connections made to a RuneJS socket server.
* `SocketServer.start(serverName, hostName, port, connectionHandlerFactory)`
  * Initializes the socket server using the specified host and port.
* `SocketServer.stop()`
  * Gracefully shuts down the socket server instance.
