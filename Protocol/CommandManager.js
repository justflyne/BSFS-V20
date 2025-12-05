const fs = require('fs');
const path = require('path');

function getFilesRecursively(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getFilesRecursively(fullPath));
    } else if (item.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

class CommandManager {
  constructor() {
    this.commands = {};

    const commandsDir = path.join(__dirname, '..', 'Protocol', 'Commands');

    try {
      const files = getFilesRecursively(commandsDir);

      for (const file of files) {
        try {
          const relativePath = path.relative(__dirname, file).replace(/\\/g, '/');
          const importPath = './' + relativePath.replace(/\.js$/, '');

          const Command = require(importPath);
          const commandInstance = new Command();

          if (commandInstance.commandID !== undefined) {
            this.commands[commandInstance.commandID] = Command;
          } else {
            console.warn(`Command ${importPath} has no 'commandID' property!`);
          }
        } catch (err) {
          console.error(`Failed to load command "${file}":`, err.message);
        }
      }
    } catch (err) {
      console.error(`Error reading commands directory "${commandsDir}":`, err);
    }
  }

  handle(id) {
    return this.commands[id];
  }

  getCommands() {
    return Object.keys(this.commands);
  }
}

module.exports = CommandManager;