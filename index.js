const net = require('net');
const config = require("./config.json");
const MessageFactory = require('./Protocol/MessageFactory');
const MessagesHandler = require("./Networking/MessagesHandler");
const Queue = require("./Networking/Queue")
require("colors");
require("./Utils/Logger");

const LoadCSV = require("./Assets/LoadCSV")
LoadCSV.loadCSV()

const server = new net.Server();
const PORT = config.port;

process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT signal. Performing cleanup...');

  console.log('Cleanup complete. Shutting down server.');
  server.close();
  process.exit();
});

global.sessionsMap = new Map();
global.online = 0;

server.on('connection', async (session) => {
    session.setNoDelay(true)
    session.setTimeout(config.sessionTimeoutSeconds * 1000)
  
    const [ip] = session.remoteAddress.split(':').slice(-1);
    session.ip = ip;

    session.Log = (text) => Client(session.ip, text);
    session.Warn = (text) => ClientWarn(session.ip, text);
    session.Err = (text) => ClientError(session.ip, text);

    session.id = global.sessionsMap.size === 0 ? 1 : global.sessionsMap.size + 1;
    session.queue = new Queue(config.maxQueueSize, config.disableQueuebugtxtFile)
    global.sessionsMap.set(session.id, session);
    global.online += 1;

    session.Log(`The player has connected! (SESSIONID: ${session.id})`);
    const packets = new MessageFactory(false).getAllPackets();
    const MessageHandler = new MessagesHandler(session, packets)

    session.on('data', async (bytes) => {
        let messageHeader = {}
        session.queue.push(bytes)
        if (!session.queue.isBusy()) {
            const queueBytes = session.queue.release()

            if (Array.isArray(queueBytes)) {
              for(let packet of queueBytes) {
                await MessageHandler.handle(packet.id, packet.bytes, { })
              }
      
              return null
            }
            
            messageHeader = {
                id: queueBytes.readUInt16BE(0),
                len: queueBytes.readUIntBE(2, 3),
                version: queueBytes.readUInt16BE(5),
                bytes: queueBytes.slice(7, messageHeader.len)
            }

            await MessageHandler.handle(messageHeader.id, messageHeader.bytes, {})
        }
    });
    session.on('end', async () => {
        session.Log('Client disconnected.')
        return session.destroy() 
        global.online -= 1;
      })
    
      session.on('error', async error => {
        try {
          return session.destroy()
          global.online -= 1;
        } catch (e) { }
      })
    
      session.on('timeout', async () => {
        session.Warn('Client timeout disconnected')
        return session.destroy()
        global.online -= 1;
      })
});

server.once('listening', () => ServerLog(`${config.serverName} started on ${PORT} port!`));
server.listen(PORT);

process.on("uncaughtException", (e) => Warn(e.stack));
process.on("unhandledRejection", (e) => Warn(e.stack));