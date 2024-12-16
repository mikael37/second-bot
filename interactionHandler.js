const { ButtonInteraction, EmbedBuilder } = require("discord.js");

module.exports = async (interaction) => {
  if (!interaction.isButton()) return; // Only handle button interactions

  const customId = interaction.customId;

  try {
    // Handle the "Mark as Completed" button
    if (customId.startsWith("confirm_data-change_")) {
      if (customId.includes("_value1")) {
        // Handle the action for Value 1
        await interaction.update({
          content: "Data change request for Value 1 completed.",
          components: [], // Optionally remove buttons after interaction
        });
      } else if (customId.includes("_value2")) {
        // Handle the action for Value 2
        await interaction.update({
          content: "Data change request for Value 2 completed.",
          components: [], // Optionally remove buttons after interaction
        });
      }
    }

    // Handle Cancel button presses
    else if (customId.startsWith("cancel_data-change_")) {
      await interaction.update({
        content: "Data change request cancelled.",
        components: [], // Remove buttons when cancelled
      });
    }

    // Handle other types of interactions
    else if (customId.startsWith("confirm_remove-data_")) {
      await interaction.update({
        content: "Data removal request completed.",
        components: [], // Remove buttons after interaction
      });
    } else if (customId.startsWith("cancel_remove-data_")) {
      await interaction.update({
        content: "Data removal request cancelled.",
        components: [], // Remove buttons
      });
    }
  } catch (error) {
    console.error("Error handling interaction:", error);
    await interaction.reply({
      content: "There was an error processing your interaction.",
      ephemeral: true,
    });
  }
};
