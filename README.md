[![RuneJS Discord Server](https://img.shields.io/discord/678751302297059336?label=RuneJS%20Discord&logo=discord)](https://discord.gg/5P74nSh)


![RuneJS](https://i.imgur.com/osF9OSD.png)

# @runejs/core

Core logging and networking functionality for RuneJS applications.

### Logger
* Full `console` logging wrappers:
    * `logger.info(...messages)`
    * `logger.debug(...messages)`
    * `logger.warn(...messages)`
    * `logger.error(...messages)`
    * `logger.fatal(...messages)`
    * `logger.trace(...messages)`
* Ability to set logging date/time format via `setLoggerDateFormat(format)`

### Byte Buffer
* Node `Uint8Array` wrapper with additional utility functions.
* Unified configurable `get` and `put` methods to easily move bytes within the buffer.
* Int24, Smart, Long and String type support.
* Big endian, little endian, and mixed endian support.
* Bit access through `openBitBuffer()`, `putBits()`, and `closeBitBuffer()`

### Networking Components

#### openServer(name, host, port, connectionHandlerFactory)
Spins up a new Node Socket server with the specified host and port.

#### SocketConnectionHandler
Handles connections made to a Socket server opened via `openServer()`

#### ServerConfigOptions
Options for a configured Socket server, imported using the `parseServerConfig()` function.
