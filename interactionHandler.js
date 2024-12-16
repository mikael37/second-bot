const { ButtonInteraction } = require("discord.js");

module.exports = async (interaction) => {
  if (!interaction.isButton()) return;

  const customId = interaction.customId;

  try {
    if (customId.startsWith("confirm_data-change_")) {
      await interaction.update({
        content: "Data change request confirmed.",
        components: [], // Disable buttons after interaction
      });
    } else if (customId.startsWith("cancel_data-change_")) {
      await interaction.update({
        content: "Data change request cancelled.",
        components: [],
      });
    } else {
      // Fallback for unrecognized customId
      await interaction.reply({
        content: "Unhandled button interaction.",
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error("Error handling interaction:", error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "An error occurred while processing the interaction.",
        ephemeral: true,
      });
    }
  }
};
