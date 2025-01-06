require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

// Define the list of commands you want to skip (can also be pulled from .env)
const commandsNotToDeploy = process.env.COMMANDS_NOT_TO_DEPLOY
  ? process.env.COMMANDS_NOT_TO_DEPLOY.split(",")
  : [];

console.log("Commands NOT to deploy:", commandsNotToDeploy);

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
      // Only add commands that are NOT in the commandsNotToDeploy list
      if (commandsNotToDeploy.length === 0 || !commandsNotToDeploy.includes(command.data.name)) {
        commands.push(command.data.toJSON());
        console.log(`Command ${command.data.name} will be deployed.`);
      } else {
        console.log(`Command ${command.data.name} is skipped (not in the deploy list).`);
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
const allowedGuildIds = process.env.GUILD_ID.split(","); // Guild IDs to deploy commands to

if (!token || !clientId || !allowedGuildIds) {
  console.error(
    "Missing one or more environment variables: DISCORD_TOKEN, clientId, GUILD_ID."
  );
  process.exit(1); // Exit if variables are not defined
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: "10" }).setToken(token);

// Function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function deployCommandsWithRetry() {
  try {
    console.log(`Deleting commands from all guilds...`);

    // Get all guilds the bot is in
    const guilds = await rest.get(Routes.userGuilds());

    // Loop through all guilds the bot is in and delete guild-specific commands
    for (const guild of guilds) {
      console.log(`Deleting guild-specific commands from guild: ${guild.id}`);
      const existingGuildCommands = await rest.get(Routes.applicationGuildCommands(clientId, guild.id));
      for (const command of existingGuildCommands) {
        await rest.delete(Routes.applicationGuildCommand(clientId, guild.id, command.id));
        console.log(`Deleted guild-specific command: ${command.name} in guild ${guild.id}`);
      }
    }

    // Delete global commands
    console.log(`Deleting global commands...`);
    const existingGlobalCommands = await rest.get(Routes.applicationCommands(clientId));
    for (const command of existingGlobalCommands) {
      await rest.delete(Routes.applicationCommand(clientId, command.id));
      console.log(`Deleted global command: ${command.name}`);
    }

    console.log(`Deleted all commands from the bot.`);

    // Deploy commands only to allowed guilds
    for (const guildId of allowedGuildIds) {
      console.log(`Deploying commands to allowed guild: ${guildId}`);
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log(`Commands deployed to guild: ${guildId}`);
      
      await delay(2000);  // Add a delay between guild deployments
    }

    console.log("Successfully deployed commands to allowed guilds.");
  } catch (error) {
    if (error.httpStatus === 429) {
      // Handle rate limit error
      const retryAfter = error.headers['retry-after'] || 1000; // Default to 1 second if no retry-after header is present
      console.log(`Rate limited! Retrying after ${retryAfter}ms`);
      await delay(retryAfter);
      await deployCommandsWithRetry();  // Retry after waiting
    } else {
      console.error("Error deploying commands:", error);
    }
  }
}

deployCommandsWithRetry();
