const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userid")
    .setDescription("Replies with Account ID of the user"),
  async execute(interaction) {
    await interaction.reply(`${client.user.tag}`);
  },
};
