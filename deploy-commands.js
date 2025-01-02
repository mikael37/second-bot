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
const guildIds = process.env.GUILD_ID.split(",");
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
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // Loop through each guildId and deploy commands
    for (const guildId of guildIds) {
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );

      console.log(`Successfully reloaded commands for guild: ${guildId}`);
    }

    console.log(`Successfully reloaded commands for all specified guilds.`);
  } catch (error) {
    console.error(error);
  }
})();
