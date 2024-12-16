const { EmbedBuilder } = require("discord.js");

module.exports = async (interaction) => {
  if (!interaction.isButton()) {
    return;
  }

  const customId = interaction.customId;

  try {
    if (customId.startsWith("confirm_remove_data")) {
      // Handle confirm action (remove data)
      const updatedEmbed = new EmbedBuilder()
        .setColor(0x2f2f2f) // Light grey
        .setTitle(`Data Change Request #<count>`) // Update with appropriate count
        .setDescription("Data removal request completed.")
        .setTimestamp();

      await interaction.update({
        // content: "Data removal request completed.",
        components: [], // Disable buttons
        embeds: [updatedEmbed], // Send updated embed
      });
    } else if (customId.startsWith("cancel_remove_data")) {
      // Handle cancel action (remove data)
      const updatedEmbed = new EmbedBuilder()
        .setColor(0xff0000) // Light red
        .setTitle(`Data Change Request #<count>`) // Update with appropriate count
        .setDescription("Data removal request cancelled.")
        .setTimestamp();

      await interaction.update({
        // content: "Data removal request cancelled.",
        components: [], // Disable buttons
        embeds: [updatedEmbed], // Send updated embed
      });
    } else {
      await interaction.reply({
        // content: `Unhandled button interaction: ${customId}`,
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
