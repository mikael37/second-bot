const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mypermissions")
    .setDescription("Lists all the bot's permissions in the current channel."),
  async execute(interaction) {
    // Get the bot's permissions in the current channel
    const permissions = interaction.guild.me.permissionsIn(interaction.channel);

    // List all permissions the bot has in this channel
    const permissionList = permissions.toArray().join(", ") || "No permissions";

    // Send the permission list as a reply
    await interaction.reply(`The bot has the following permissions in this channel: \n${permissionList}`);
  },
};
