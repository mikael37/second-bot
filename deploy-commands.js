require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const commands = [];
const guildCommands = []; // For guild-specific commands
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      // Check if this command is guild-specific (if a guildId is set for the command)
      if (command.guildId) {
        guildCommands.push(command.data.toJSON());
      } else {
        commands.push(command.data.toJSON());
      }
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// Fetch environment variables
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // Guild ID where sync commands are valid

if (!token || !clientId) {
  console.error(
    "Missing one or more environment variables: DISCORD_TOKEN, clientId."
  );
  process.exit(1); // Exit if variables are not defined
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} global application (/) commands.`
    );

    // Deploy global commands
    const data = await rest.put(
      Routes.applicationCommands(clientId), // Deploy globally
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} global application (/) commands.`
    );

    if (guildId) {
      console.log(
        `Started refreshing ${guildCommands.length} guild-specific application (/) commands.`
      );

      // Deploy guild-specific commands to a particular guild
      const guildData = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId), // Deploy for the specific guild
        { body: guildCommands }
      );

      console.log(
        `Successfully reloaded ${guildData.length} guild-specific application (/) commands for guild ${guildId}.`
      );
    }
  } catch (error) {
    console.error(error);
  }
})();
