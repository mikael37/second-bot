const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("syncdatabase")
    .setDescription("Assign roles and rename users in bulk."),
    
  async execute(interaction) {
    const allowedGuildId = process.env.SYNC_DB_GUILD_ID;

    if (interaction.guild.id !== allowedGuildId) {
      return await interaction.reply({
        content: "This command is not available in this server.",
        ephemeral: true,
      });
    }

    try {
      // Load user data from JSON file
      const usersData = JSON.parse(fs.readFileSync("userData.json"));

      // Defer the reply to allow processing time
      await interaction.deferReply();

      // Send confirmation message with buttons
      const confirmButton = new ButtonBuilder()
        .setCustomId("confirmSync")
        .setLabel("Confirm Sync")
        .setStyle(ButtonStyle.Primary);

      const cancelButton = new ButtonBuilder()
        .setCustomId("cancelSync")
        .setLabel("Cancel Sync")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

      await interaction.editReply({
        content: "Do you want to proceed with syncing the database?",
        components: [row],
      });
    } catch (error) {
      console.error("Bulk assignment failed:", error);
      await interaction.editReply('An error occurred while assigning roles in bulk.');
    }
  },
};
