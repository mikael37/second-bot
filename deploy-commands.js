require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

// Loop through the command files and add them to the commands array
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
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
const allowedGuildIds = process.env.GUILD_ID.split(","); // Guild IDs to deploy commands to

if (!token || !clientId || !allowedGuildIds) {
  console.error(
    "Missing one or more environment variables: DISCORD_TOKEN, clientId, GUILD_ID."
  );
  process.exit(1); // Exit if variables are not defined
}

// Log the allowed guild IDs to ensure they are being correctly loaded
console.log("Allowed Guild IDs:", allowedGuildIds);

// Construct and prepare an instance of the REST module
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} global application (/) commands.`
    );

    // Get all guilds the bot is in
    const guilds = await rest.get(Routes.userGuilds());

    // Loop through all guilds the bot is in
    for (const guild of guilds) {
      console.log(`Deleting commands from guild: ${guild.id}`);

      // Fetch existing commands and delete them
      const existingCommands = await rest.get(Routes.applicationGuildCommands(clientId, guild.id));
      for (const command of existingCommands) {
        await rest.delete(Routes.applicationGuildCommand(clientId, guild.id, command.id));
        console.log(`Deleted old command: ${command.name} in guild ${guild.id}`);
      }

      // Only deploy commands to guilds in allowedGuildIds
      if (allowedGuildIds.includes(guild.id)) {
        // Deploy new commands for the allowed guild
        const guildData = await rest.put(
          Routes.applicationGuildCommands(clientId, guild.id),
          { body: commands }
        );
        console.log(
          `Successfully reloaded ${guildData.length} application (/) commands for guild ${guild.id}.`
        );
      } else {
        console.log(`Skipping refresh for guild: ${guild.id} (not in allowed list)`);
      }
    }

    console.log("Successfully deployed commands to all allowed guilds.");

  } catch (error) {
    console.error("Error deploying commands:", error);
  }
})();
