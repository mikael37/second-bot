const { EmbedBuilder } = require("discord.js");

module.exports = async (interaction) => {
  if (!interaction.isButton()) {
    console.log("Interaction is not a button. Exiting.");
    return;
  }

  const customId = interaction.customId;
  const dataChangeRequestCount = 41; // Replace with dynamic count fetching mechanism

  console.log(`Interaction received: customId=${customId}`);

  try {
    if (customId.startsWith("confirm_remove_data")) {
      console.log("Handling confirm_remove_data action.");

      const updatedEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(`Data Removal Request #${dataChangeRequestCount}`)
        .setDescription("Data removal request completed.")
        .setTimestamp();

      console.log("Updating interaction with confirmed removal embed.");
      await interaction.update({
        components: [], // Disable buttons
        embeds: [updatedEmbed], // Send updated embed
      });
    } else if (customId.startsWith("cancel_remove_data")) {
      console.log("Handling cancel_remove_data action.");

      const updatedEmbed = new EmbedBuilder()
        .setColor(0x2c2d30) // Light red
        .setTitle(`Data Removal Request #${dataChangeRequestCount}`)
        .setDescription("Data removal request cancelled.")
        .setTimestamp();

      console.log("Updating interaction with cancelled removal embed.");
      await interaction.update({
        components: [], // Disable buttons
        embeds: [updatedEmbed], // Send updated embed
      });
    } else if (customId.startsWith("confirm_change_data")) {
      console.log("Handling confirm_change_data action.");

      const updatedEmbed = new EmbedBuilder()
        .setColor(0x00ff00) // Green for confirmation
        .setTitle(`Data Change Request #${dataChangeRequestCount}`)
        .setDescription("Data change request confirmed.")
        .setTimestamp();

      console.log("Updating interaction with confirmed data change embed.");
      await interaction.update({
        components: [], // Disable buttons
        embeds: [updatedEmbed], // Send updated embed
      });
    } else if (customId.startsWith("cancel_change_data")) {
      console.log("Handling cancel_change_data action.");

      const updatedEmbed = new EmbedBuilder()
        .setColor(0x2c2d30) // Light gray
        .setTitle(`Data Change Request #${dataChangeRequestCount}`)
        .setDescription("Data change request cancelled.")
        .setTimestamp();

      console.log("Updating interaction with cancelled data change embed.");
      await interaction.update({
        components: [], // Disable buttons
        embeds: [updatedEmbed], // Send updated embed
      });
    } else {
      console.log(`Unhandled button interaction: ${customId}`);
      await interaction.reply({
        content: `Unhandled button interaction: ${customId}`,
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error("Error occurred during interaction processing:", error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "An error occurred while processing the interaction.",
        ephemeral: true,
      });
    }
  }
};
