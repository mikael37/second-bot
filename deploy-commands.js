require("dotenv").config();
const { REST, Routes } = require("discord.js");

const { DISCORD_TOKEN: token, CLIENT_ID: clientId } = process.env;
const allowedGuildIds = process.env.GUILD_ID.split(","); // Guild IDs to deploy commands to

if (!token || !clientId || !allowedGuildIds) {
  console.error("Missing one or more environment variables: DISCORD_TOKEN, clientId, GUILD_ID.");
  process.exit(1); // Exit if variables are not defined
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("Started deleting commands from all guilds...");

    // Get all guilds the bot is in
    const guilds = await rest.get(Routes.userGuilds());

    // Loop through all guilds the bot is in and delete commands
    for (const guild of guilds) {
      console.log(`Deleting commands from guild: ${guild.id}`);

      // Fetch existing commands and delete them for every guild the bot is in
      const existingCommands = await rest.get(Routes.applicationGuildCommands(clientId, guild.id));
      for (const command of existingCommands) {
        await rest.delete(Routes.applicationGuildCommand(clientId, guild.id, command.id));
        console.log(`Deleted command: ${command.name} in guild ${guild.id}`);
      }
    }

    console.log("Successfully deleted commands from all guilds.");

  } catch (error) {
    console.error("Error deleting commands:", error);
  }
})();
