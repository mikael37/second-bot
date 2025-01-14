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
      const channel = interaction.options.getChannel("channel");

      const replyMessage = await interaction.reply({
        content: "The process of logging user information has been initiated. Please stand by...",
        fetchReply: true,
      });

      const usersData = JSON.parse(fs.readFileSync("userData.json"));

      const logMessages = [];

      for (const user of usersData) {
        const member = await interaction.guild.members.fetch(user.discordId).catch(err => {
          console.error(`User with ID ${user.discordId} not found:`, err);
          return null;
        });

        if (!member) {
          logMessages.push(`The user with ID <@${user.discordId}> could not be located in the server.`);
          continue;
        }

        const roles = member.roles.cache
          .filter(role => role.id !== interaction.guild.id)
          .map(role => role.name)
          .join(", ");

        const formattedRoles = `\`${roles}\``;

        const logMessage = `User: <@${user.discordId}> \n` +
          `Username: ${member.user.username} (${member.user.id}) \n` +
          `Roles: ${formattedRoles} \n` +
          `Log time: ${new Date().toLocaleString()}`;

        logMessages.push(logMessage);
        logMessages.push("------------------------------------------------------");
      }

      const maxLength = 2000;
      let currentMessage = "";
      for (let i = 0; i < logMessages.length; i++) {
        const message = logMessages[i];
        
        if ((currentMessage + message).length > maxLength) {
          await channel.send(currentMessage);
          currentMessage = message + "\n";
        } else {
          currentMessage += message + "\n";
        }
      }

      if (currentMessage.length > 0) {
        await channel.send(currentMessage);
      }

      await replyMessage.edit({
        content: "User information logging has been completed. The logs have been successfully shared in the specified channel.",
        ephemeral: true,
      });

      setTimeout(async () => {
        try {
          await replyMessage.delete();
        } catch (error) {
          console.error("Error deleting reply:", error);
        }
      }, 100);

    } catch (error) {
      console.error("An error occurred during user information logging:", error);
      await interaction.editReply({
        content: "An unexpected error occurred while processing the command. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
