const fs = require('fs');
const path = require('path');
const glob = require('glob');

class MessageFactory {
  constructor(useLegacyPacketLoader = false) {
    this.packets = {};

    const messagesDir = path.join(__dirname, 'Messages');

    if (!useLegacyPacketLoader) {
      try {
        const files = glob.sync(path.join(messagesDir, '**', '*.js'));

        for (const file of files) {
          try {
            const relativePath = path.relative(__dirname, file);
            const importPath = './' + relativePath.replace(/\\/g, '/');
            
            const Packet = require(importPath);
            const packetInstance = new Packet();

            if (packetInstance.id !== undefined) {
              this.packets[packetInstance.id] = Packet;
            } else {
              console.warn(`Packet ${importPath} has no 'id' property!`);
            }
          } catch (err) {
            console.error(`Failed to load packet "${file}":`, err.message);
          }
        }
      } catch (err) {
        console.error('Error reading messages directory with glob:', err);
      }
    } else {    
      const clientDir = path.join(messagesDir, 'Client');
      if (fs.existsSync(clientDir)) {
        const files = fs.readdirSync(clientDir).filter(file => file.endsWith('.js'));
        for (const file of files) {
          try {
            const Packet = require(`./Messages/Client/${file.replace('.js', '')}`);
            const packetInstance = new Packet();
            if (packetInstance.id !== undefined) {
              this.packets[packetInstance.id] = Packet;
            }
          } catch (err) {
            console.error(`Failed to load legacy packet "${file}":`, err.message);
          }
        }
      } else {
        console.warn('Legacy Client directory does not exist:', clientDir);
      }
    }
  }

  getAllPackets() {
    return this.packets;
  }
}

module.exports = MessageFactory;