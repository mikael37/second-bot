const { EmbedBuilder } = require("discord.js");

module.exports = async (interaction) => {
  if (!interaction.isButton()) {
    return;
  }

  const customId = interaction.customId;

  try {
    // You should fetch or track the request count somewhere here
    const dataChangeRequestCount = 41; // Replace with dynamic count fetching mechanism

    if (customId.startsWith("confirm_data-change_")) {
      // Create the updated embed with light grey color
      const updatedEmbed = new EmbedBuilder()
        .setColor(0xd3d3d3) // Light grey
        .setTitle(`Data Change Request #${dataChangeRequestCount}`) // Dynamically update with count
        .setDescription("Data change request completed.")
        .setTimestamp();

      // Update the message
      await interaction.update({
        content: "Data change request completed.",
        components: [], // Disable buttons
        embeds: [updatedEmbed], // Send updated embed
      });
    } else if (customId.startsWith("cancel_data-change_")) {
      // Create the updated embed with light red color
      const updatedEmbed = new EmbedBuilder()
        .setColor(0xff0000) // Light red
        .setTitle(`Data Change Request #${dataChangeRequestCount}`) // Dynamically update with count
        .setDescription("Data change request cancelled.")
        .setTimestamp();

      // Update the message
      await interaction.update({
        content: "Data change request cancelled.",
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
