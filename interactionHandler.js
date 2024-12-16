const { ButtonInteraction } = require("discord.js");

module.exports = async (interaction) => {
  if (!interaction.isButton()) {
    return;
  }

  const customId = interaction.customId;

  try {
    if (customId.startsWith("confirm_data-change_")) {
      await interaction.update({
        content: "Data change request completed.",
        components: [],
      });
    } else if (customId.startsWith("cancel_data-change_")) {
      await interaction.update({
        content: "Data change request cancelled.",
        components: [],
      });
    } else {
      await interaction.reply({
        content: `Unhandled button interaction: ${customId}`,
        ephemeral: true,
      });
    }
  } catch (error) {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "An error occurred while processing the interaction.",
        ephemeral: true,
      });
    }
  }
};
