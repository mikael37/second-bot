const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loguserinfo")
    .setDescription("Logs the server username and roles of users based on userData.json")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("The channel to send logs to")
        .setRequired(true)),

  async execute(interaction) {
    try {
      // Get the channel to send the log to
      const channel = interaction.options.getChannel("channel");

      // Send a reply to indicate the process has started
      const replyMessage = await interaction.reply({
        content: "The process of logging user information has been initiated. Please stand by...",
        fetchReply: true, // Fetch the reply message to later delete it
      });

      // Load user data from JSON file
      const usersData = JSON.parse(fs.readFileSync("userData.json"));

      const logMessages = [];

      // Loop through each user in the userData
      for (const user of usersData) {
        const member = await interaction.guild.members.fetch(user.discordId).catch(err => {
          console.error(`User with ID ${user.discordId} not found:`, err);
          return null;
        });

        if (!member) {
          logMessages.push(`The user with ID <@${user.discordId}> could not be located in the server.`);
          continue;
        }

        // Extract user's roles and format them
        const roles = member.roles.cache
          .filter(role => role.id !== interaction.guild.id) // Remove @everyone role
          .map(role => role.name)
          .join(", "); // Join roles with a comma

        // Place roles inside backticks
        const formattedRoles = `\`${roles}\``;

        const logMessage = `User: <@${user.discordId}> \n` +
          `Username: ${member.user.username} (${member.user.id}) \n` +
          `Roles: ${formattedRoles} \n` +
          `Log time: ${new Date().toLocaleString()}`;

        logMessages.push(logMessage);

        // Separator for each log entry
        logMessages.push("------------------------------------------------------");
      }

      // Split the logMessages into chunks
      const maxLength = 2000; // Max Discord message length
      let currentMessage = "";
      for (let i = 0; i < logMessages.length; i++) {
        const message = logMessages[i];
        
        // If adding the message would exceed maxLength, send the current message and start a new one
        if ((currentMessage + message).length > maxLength) {
          await channel.send(currentMessage);
          currentMessage = message + "\n"; // Start a new chunk
        } else {
          currentMessage += message + "\n";
        }
      }

      // Send any remaining log messages
      if (currentMessage.length > 0) {
        await channel.send(currentMessage);
      }

      // Edit the initial message to indicate completion
      await replyMessage.edit({
        content: "User information logging has been completed. The logs have been successfully shared in the specified channel.",
        ephemeral: true,
      });

      // Delete the message after 10 seconds
      setTimeout(async () => {
        try {
          await replyMessage.delete();
        } catch (error) {
          console.error("Error deleting reply:", error);
        }
      }, 100); // 10 seconds timer

    } catch (error) {
      console.error("An error occurred during user information logging:", error);
      await interaction.editReply({
        content: "An unexpected error occurred while processing the command. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
