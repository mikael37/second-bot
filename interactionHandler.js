const { EmbedBuilder } = require("discord.js");

module.exports = async (interaction) => {
  if (!interaction.isButton()) {
    return;
  }

  const customId = interaction.customId;
  const dataChangeRequestCount = 41;

  // Log important information
  logCommandDetails(interaction, customId);

  try {
    if (customId.startsWith("confirm_remove_data")) {
      const updatedEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(`Data Removal Request #${dataChangeRequestCount}`)
        .setDescription("Data removal request completed.")
        .setTimestamp();

      await interaction.update({
        components: [],
        embeds: [updatedEmbed],
      });
    } else if (customId.startsWith("cancel_remove_data")) {
      const updatedEmbed = new EmbedBuilder()
        .setColor(0x2c2d30)
        .setTitle(`Data Removal Request #${dataChangeRequestCount}`)
        .setDescription("Data removal request cancelled.")
        .setTimestamp();

      await interaction.update({
        components: [],
        embeds: [updatedEmbed],
      });
    } else if (customId.startsWith("confirm_change_data")) {
      const updatedEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`Data Change Request #${dataChangeRequestCount}`)
        .setDescription("Data change request confirmed.")
        .setTimestamp();

      await interaction.update({
        components: [],
        embeds: [updatedEmbed],
      });
    } else if (customId.startsWith("cancel_change_data")) {
      const updatedEmbed = new EmbedBuilder()
        .setColor(0x2c2d30)
        .setTitle(`Data Change Request #${dataChangeRequestCount}`)
        .setDescription("Data change request cancelled.")
        .setTimestamp();

      await interaction.update({
        components: [],
        embeds: [updatedEmbed],
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

// Logging function to log important details about the command
function logCommandDetails(interaction, commandId) {
  const timestamp = new Date().toISOString();
  const user = interaction.user.tag;
  const args = interaction.options ? interaction.options.data : 'No args';
  console.log(`[${timestamp}] Command executed by ${user} - Command: ${commandId}, Args: ${JSON.stringify(args)}`);
}
