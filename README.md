[![RuneJS Discord Server](https://img.shields.io/discord/678751302297059336?label=RuneJS%20Discord&logo=discord)](https://discord.gg/5P74nSh)

[![RuneJS](https://i.imgur.com/QSXNzwC.png)](https://github.com/runejs/)

# Common

Common logging, networking, compression, and other miscellaneous functionality for RuneJS.

## Exported Modules

### `@runejs/common`
* `logger` is exported as a singleton Pino logging wrapper.
  * Methods:
      * `logger.info(...messages: any[])`
      * `logger.debug(...messages: any[])`
      * `logger.warn(...messages: any[])`
      * `logger.error(...messages: any[])`
      * `logger.trace(...messages: any[])`
      * `logger.fatal(...messages: any[])`
      * `logger.destination(logDir: string)`
      * `logger.setOptions(options: Pino.LoggerOptions)`
      * `logger.setPrettyPrint(prettyPrint: boolean)`
      * `logger.setTimeFormat(format: TimeFn)`
* `ByteBuffer` is also exported at the root level.
  * Node `Uint8Array` wrapper with additional utility functions.
  * Unified configurable `get` and `put` methods to easily move bytes within the buffer.
  * Int24, Smart, Long and String type support.
  * Big endian, little endian, and mixed endian support.
  * Bit access through `openBitBuffer()`, `putBits()`, and `closeBitBuffer()`

### `@runejs/common/color`
Handles various color conversions needed by the game and tooling.
* `RGB(A)`
* `HSL` (Hue, Saturation, Lightness)
* `HSV` (Hue, Saturation, Value/Brightness)
* `HCL` (Hue, Chroma, Luminance)
* `LAB` (Lightness, A, B)

### `@runejs/common/compress`
* Exported class `Gzip` handles Gzip compression and decompression.
* Exported class `Bzip2` handles Bzip2 compression and decompression.

### `@runejs/common/crc32`
Exports a single class `Crc32` that generates CRC32 checksums for binary data files.

### `@runejs/common/encrypt`
Provides XTEA encryption and decryption functionality, as well as a key file loader.
* Exported as class `Xtea`

### `@runejs/common/net`
* `SocketServer`
  * Handles connections made to a RuneJS socket server.
* `SocketServer.launch(serverName, hostName, port, connectionHandlerFactory)`
  * Spins up a new Node Socket server with the specified host and port.
* `ServerConfigOptions`
  * Options for a configured Socket server, imported using the `parseServerConfig()` function.
