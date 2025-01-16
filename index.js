const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ActivityType,
} = require("discord.js");
const interactionHandler = require("./interactionHandler"); // Import the handler

const { DISCORD_TOKEN: token } = process.env;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.slashCommands = new Collection();
client.nonSlashCommands = new Collection();

//
// Load Slash Commands
//
const slashFoldersPath = path.join(__dirname, "commands", "slash");
const slashCommandFolders = fs.readdirSync(slashFoldersPath);

for (const folder of slashCommandFolders) {
  const commandsPath = path.join(slashFoldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.slashCommands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

//
// Load Non-Slash Commands
//
const nonSlashCommandsPath = path.join(__dirname, "commands", "non-slash");
const nonSlashCommandFiles = fs
  .readdirSync(nonSlashCommandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of nonSlashCommandFiles) {
  const filePath = path.join(nonSlashCommandsPath, file);
  const command = require(filePath);
  if ("name" in command && "execute" in command) {
    client.nonSlashCommands.set(command.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "name" or "execute" property.`
    );
  }
}

//
// Bot Ready Event
//
client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    status: "online", // Explicitly sets the bot's status to online
    activities: [
      {
        name: "for Titan movements",
        type: ActivityType.Watching, // Watching activity type
      },
    ],
  });
});

//
// Slash Command Handling
//
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isCommand()) {
    if (interaction.user.id !== "409123936748437516") {
      return interaction.reply({
        content: "You are not authorized to use this command.",
        ephemeral: true,
      });
    }

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  } else {
    await interactionHandler(interaction);
  }
});

//
// Non-Slash Command Handling
//
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const prefix = "..";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.nonSlashCommands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("There was an error executing that command.");
  }
});

//
// Log in to Discord
//
client.login(token);
