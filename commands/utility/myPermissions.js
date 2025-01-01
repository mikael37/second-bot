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

    // Create a horizontal list with each permission in rich text format
    const permissionList = permissions.toArray().map(permission => `\`${permission}\``).join(" ");

    // If no permissions, display a default message
    const message = permissionList || "`No permissions`";

    // Send the formatted permission list as a reply
    await interaction.reply(`The bot has the following permissions in this channel: ${message}`);
  },
};
