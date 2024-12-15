require('dotenv').config();
const { DISCORD_TOKEN: token, CLIENT_ID: clientId, GUILD_ID: guildId } = process.env;
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  // Grab all the command files from the commands directory you created earlier
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

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
