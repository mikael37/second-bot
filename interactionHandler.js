const { ButtonInteraction } = require("discord.js");

module.exports = async (interaction) => {
  if (!interaction.isButton()) return;

  const customId = interaction.customId;
  console.log("Button pressed with customId:", interaction.customId); // Debugging

  try {
    if (customId.startsWith("confirm_data-change_")) {
      if (customId.includes("_value1")) {
        await interaction.update({
          content: "Data change request for Value 1 completed.",
          components: [], // Remove buttons
        });
      }
    } else if (customId.startsWith("cancel_data-change_")) {
      await interaction.update({
        content: "Data change request cancelled.",
        components: [], // Remove buttons
      });
    } else {
      // Fallback for unrecognized customId
      await interaction.reply({
        content: `Unhandled button interaction: ${customId}`,
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
