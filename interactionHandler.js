const { ButtonInteraction } = require("discord.js");

module.exports = async (interaction) => {
  if (!interaction.isButton()) {
    console.log("Interaction is not a button interaction."); // Debugging
    return;
  }

  const customId = interaction.customId;
  console.log("Button interaction detected."); // Debugging
  console.log("Custom ID received:", customId); // Debugging

  try {
    // Debugging which condition is being evaluated
    if (customId.startsWith("confirm_data-change_")) {
      console.log("Processing confirm_data-change interaction."); // Debugging
      if (customId.includes("_value1")) {
        console.log("Matched confirm_data-change_value1."); // Debugging
        await interaction.update({
          content: "Data change request for Value 1 completed.",
          components: [], // Remove buttons
        });
        console.log("Interaction successfully updated for confirm_data-change_value1."); // Debugging
      } else {
        console.log("Unhandled confirm_data-change sub-value in customId:", customId); // Debugging
      }
    } else if (customId.startsWith("cancel_data-change_")) {
      console.log("Processing cancel_data-change interaction."); // Debugging
      await interaction.update({
        content: "Data change request cancelled.",
        components: [], // Remove buttons
      });
      console.log("Interaction successfully updated for cancel_data-change."); // Debugging
    } else {
      // Debugging fallback
      console.log("Unhandled customId:", customId); // Debugging
      await interaction.reply({
        content: `Unhandled button interaction: ${customId}`,
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error("Error occurred while handling interaction:", error); // Debugging
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "An error occurred while processing the interaction.",
        ephemeral: true,
      });
    } else {
      console.log("Failed to send error reply because interaction was already handled."); // Debugging
    }
  }
};
