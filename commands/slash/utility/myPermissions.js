const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mypermissions")
    .setDescription("Lists all the bot's permissions in the current channel."),
  async execute(interaction) {
    const botMember = await interaction.guild.members.fetchMe();

    const permissions = botMember.permissionsIn(interaction.channel);

    const permissionList = permissions.toArray().map(permission => `\`${permission}\``).join(" ");

    const message = permissionList || "`No permissions`";

    await interaction.reply(`The bot has the following permissions in this channel: \n${message}`);
  },
};
