const { EmbedBuilder } = require("discord.js");

module.exports = async (interaction) => {
  if (!interaction.isButton()) {
    return;
  }

  const customId = interaction.customId;

  // Example of dynamically fetched request count (you can replace it with the actual count fetching logic)
  const dataChangeRequestCount = 41; // Replace with dynamic count fetching mechanism

  try {
    if (customId.startsWith("confirm_remove_data")) {
      // Handle confirm action (remove data)
      const updatedEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(`Data Removal Request #${dataChangeRequestCount}`) // Dynamically update with count
        .setDescription("Data removal request completed.")
        .setTimestamp();

      await interaction.update({
        components: [], // Disable buttons
        embeds: [updatedEmbed], // Send updated embed
      });
    } else if (customId.startsWith("cancel_remove_data")) {
      // Handle cancel action (remove data)
      const updatedEmbed = new EmbedBuilder()
        .setColor(0x2c2d30) // Light red
        .setTitle(`Data Removal Request #${dataChangeRequestCount}`) // Dynamically update with count
        .setDescription("Data removal request cancelled.")
        .setTimestamp();

      await interaction.update({
        components: [], // Disable buttons
        embeds: [updatedEmbed], // Send updated embed
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
