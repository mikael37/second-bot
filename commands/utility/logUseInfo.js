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

      // Load user data from JSON file
      const usersData = JSON.parse(fs.readFileSync("userData.json"));

      // Send a reply to indicate the process has started
      await interaction.reply({
        content: "Logging user information, please wait...",
        ephemeral: true,
      });

      const logMessages = [];

      // Loop through each user in the userData
      for (const user of usersData) {
        const member = await interaction.guild.members.fetch(user.discordId).catch(err => {
          console.error(`User with ID ${user.discordId} not found:`, err);
          return null;
        });

        if (!member) {
          logMessages.push(`User with ID <@${user.discordId}> could not be found in the server.`);
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

      // Send the log messages to the specified channel
      await channel.send({
        content: logMessages.join("\n"), // Join all messages into a single string with newlines
      });

    } catch (error) {
      console.error("Error logging user information:", error);
      await interaction.editReply({
        content: "An error occurred while processing the command.",
        ephemeral: true,
      });
    }
  },
};
