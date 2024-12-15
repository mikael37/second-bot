require('dotenv').config();
const { DISCORD_TOKEN: token, CLIENT_ID: clientId, GUILD_ID: guildId } = process.env;
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];

// Function to recursively read all command files in directories
function readCommandsFromDir(dirPath) {
  const filesAndFolders = fs.readdirSync(dirPath);

  for (const fileOrFolder of filesAndFolders) {
    const currentPath = path.join(dirPath, fileOrFolder);
    const stat = fs.lstatSync(currentPath);

    if (stat.isDirectory()) {
      // Recursively scan subfolders
      readCommandsFromDir(currentPath);
    } else if (fileOrFolder.endsWith('.js')) {
      // Require the command if it's a JS file
      const command = require(currentPath);
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
      } else {
        console.log(`[WARNING] The command at ${currentPath} is missing a required "data" or "execute" property.`);
      }
    }
  }
}

// Grab all command files from all subfolders within the "commands" directory
const commandsDir = path.join(__dirname, 'commands');
readCommandsFromDir(commandsDir);

// Create a new REST instance
const rest = new REST().setToken(token);

// Delete old commands
(async () => {
  try {
    console.log('Started deleting old commands...');

    // Fetch all global commands
    const existingCommands = await rest.get(Routes.applicationCommands(clientId));
    console.log(`Deleting ${existingCommands.length} commands`);

    // Delete each command
    for (const command of existingCommands) {
      await rest.delete(Routes.applicationCommand(clientId, command.id));
      console.log(`Deleted command: ${command.name}`);
    }

    console.log('All old commands deleted successfully!');

    // Now deploy your new commands
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('Error during command deletion or deployment:', error);
  }
})();
