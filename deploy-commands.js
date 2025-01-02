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
const allowedGuildIds = process.env.GUILD_ID.split(","); // This is a list of guild IDs from the .env
if (!token || !clientId || !allowedGuildIds) {
  console.error(
    "Missing one or more environment variables: DISCORD_TOKEN, clientId, GUILD_ID."
  );
  process.exit(1); // Exit if variables are not defined
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    // 1. Deploy global commands
    console.log(
      `Started refreshing ${commands.length} global application (/) commands.`
    );

    const globalData = await rest.put(
      Routes.applicationCommands(clientId), // Deploy globally
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${globalData.length} global application (/) commands.`
    );

    // 2. Deploy guild-specific commands to the allowed guilds
    for (const guildId of allowedGuildIds) {
      console.log(
        `Started refreshing guild-specific application (/) commands for guild ${guildId}.`
      );

      // Skip guild if it's not in the allowed list
      if (!allowedGuildIds.includes(guildId)) {
        console.log(`Skipping guild ${guildId} as it is not in the allowed list.`);
        continue;
      }

      // Fetch existing guild-specific commands and delete them
      const existingGuildCommands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));
      for (const command of existingGuildCommands) {
        await rest.delete(Routes.applicationGuildCommand(clientId, guildId, command.id));
        console.log(`Deleted old command: ${command.name} in guild ${guildId}`);
      }

      // Deploy new guild-specific commands
      const guildData = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId), // Deploy for the specific guild
        { body: guildCommands }
      );

      console.log(
        `Successfully reloaded ${guildData.length} guild-specific application (/) commands for guild ${guildId}.`
      );
    }
  } catch (error) {
    console.error("Error deploying commands:", error);
  }
})();
