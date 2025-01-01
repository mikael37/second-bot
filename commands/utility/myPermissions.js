const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mypermissions")
    .setDescription("Lists all the bot's permissions in the current channel."),
  async execute(interaction) {
    // Ensure the bot is fully available
    const botMember = await interaction.guild.members.fetchMe();

    // Get the bot's permissions in the current channel
    const permissions = botMember.permissionsIn(interaction.channel);

    // List all permissions the bot has in this channel
    const permissionList = permissions.toArray().join(", ") || "No permissions";

    // Send the permission list as a reply
    await interaction.reply(`The bot has the following permissions in this channel: \n${permissionList}`);
  },
};
