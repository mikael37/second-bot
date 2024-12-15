const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env;

// Define your command(s)
const commands = [
  new SlashCommandBuilder().setName('request').setDescription('Handle a request command'),
  // Add other commands here...
]
  .map(command => command.toJSON());

// Register the commands with Discord
const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Register commands globally (or use Routes.applicationGuildCommands for specific guild)
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),  // Use Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID) for guild-specific commands
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();