const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require("discord.js");
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

client.commands = new Collection();

// Load commands
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
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    status: 'online', // Explicitly sets the bot's status to online
    activities: [
      {
        name: "for Titan movements",
        type: ActivityType.Watching, // Watching activity type
      },
    ],
  });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isCommand()) {
    // Check if the user has the specific ID (replace "001" with the actual ID)
    if (interaction.user.id !== "409123936748437516") {
      return interaction.reply({
        content: "You are not authorized to use this command.",
        ephemeral: true, // Makes the message visible only to the user
      });
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      // Execute the command
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  } else {
    // Handle interactions like button presses here
    await interactionHandler(interaction);
  }
});

client.login(token);
