const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("syncdatabase")
    .setDescription("Assign roles and rename users in bulk."),

  async execute(interaction) {
    try {
      // Load user data from JSON file
      const usersData = JSON.parse(fs.readFileSync("userData.json"));

      // Defer the reply to allow processing time (ephemeral)
      await interaction.deferReply({ ephemeral: true });

      // Send confirmation message with buttons (ephemeral)
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
        content: "Please confirm if you would like to proceed with the database synchronization. This action will update roles and nicknames for all relevant users.",
        components: [row],
      });
    } catch (error) {
      console.error("Bulk assignment failed:", error);
      await interaction.editReply({
        content: "An error occurred during the execution of the command. Please try again later or contact support if the issue persists.",
        ephemeral: true,
      });
    }
  },
};
