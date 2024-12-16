const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

// File path to store the dataChangeRequestCount
const countFilePath = path.join(__dirname, "dataCount.json");

// Load dataChangeRequestCount from file, default to 0 if file doesn't exist
let dataChangeRequestCount = 0;
if (fs.existsSync(countFilePath)) {
  const fileData = JSON.parse(fs.readFileSync(countFilePath, "utf8"));
  dataChangeRequestCount = fileData.count || 0;
}

// Function to save dataChangeRequestCount to the file
const saveDataChangeRequestCount = () => {
  fs.writeFileSync(countFilePath, JSON.stringify({ count: dataChangeRequestCount }, null, 2));
};

module.exports = async (interaction) => {
  if (!interaction.isButton()) {
    return;
  }

  const customId = interaction.customId;

  try {
    if (customId.startsWith("confirm_remove_data")) {
      const updatedEmbed = new EmbedBuilder()
        .setColor(0x19e619)
        .setTitle(`Data Removal Request #${dataChangeRequestCount}`)
        .setDescription("Data removal request completed.")
        .setTimestamp();

      await interaction.update({
        components: [], // Disable buttons
        embeds: [updatedEmbed], // Send updated embed
      });

      console.log(`Data removal request completed by ${interaction.user.tag}.`);
    } else if (customId.startsWith("cancel_remove_data")) {
      const updatedEmbed = new EmbedBuilder()
        .setColor(0x2c2d30) // Light red
        .setTitle(`Cancelled: Data Removal Request #${dataChangeRequestCount}`)
        .setDescription("Data removal request cancelled.")
        .setTimestamp();

      await interaction.update({
        components: [], // Disable buttons
        embeds: [updatedEmbed], // Send updated embed
      });

      console.log(`Data removal request cancelled by ${interaction.user.tag}.`);
    } else if (customId.startsWith("confirm_change_data")) {
      const updatedEmbed = new EmbedBuilder()
        .setColor(0x00ff00) // Green for confirmation
        .setTitle(`Data Change Request #${dataChangeRequestCount}`)
        .setDescription("Data change request completed.")
        .setTimestamp();

      await interaction.update({
        components: [], // Disable buttons
        embeds: [updatedEmbed], // Send updated embed
      });

      console.log(`Data change request completed by ${interaction.user.tag}.`);
    } else if (customId.startsWith("cancel_change_data")) {
      const updatedEmbed = new EmbedBuilder()
        .setColor(0x2c2d30) // Light gray
        .setTitle(`Cancelled: Data Change Request #${dataChangeRequestCount}`)
        .setDescription("Data change request cancelled.")
        .setTimestamp();

      await interaction.update({
        components: [], // Disable buttons
        embeds: [updatedEmbed], // Send updated embed
      });

      console.log(`Data change request cancelled by ${interaction.user.tag}.`);
    } else {
      await interaction.reply({
        content: `Unhandled button interaction: ${customId}`,
        ephemeral: true,
      });
    }

    // Optionally, after processing the interaction, save the updated count
    saveDataChangeRequestCount();

  } catch (error) {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "An error occurred while processing the interaction.",
        ephemeral: true,
      });
    }
  }
};
