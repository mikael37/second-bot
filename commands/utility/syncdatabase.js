const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

// List of allowed server IDs for this command
const allowedServers = ["1047266915120332801"]; // Add the server IDs where the command is allowed

module.exports = {
  data: new SlashCommandBuilder()
    .setName("syncdatabase")
    .setDescription("Assign roles and rename users in bulk."),
  
  async execute(interaction) {
    // Check if the command is being used in an allowed server
    if (!allowedServers.includes(interaction.guild.id)) {
      return interaction.reply({
        content: "This command cannot be used in this server.",
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
