const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dataFilePath = path.join(__dirname, "dataCount.json");

// Load the dataChangeRequestCount from the file
const loadDataChangeRequestCount = () => {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data).count;
  } catch (err) {
    console.error("Error reading data from dataCount.json:", err);
    return 0; // Default to 0 if the file doesn't exist or is corrupted
  }
};

// Save the dataChangeRequestCount to the file
const saveDataChangeRequestCount = (count) => {
  try {
    const data = { count };
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving data to dataCount.json:", err);
  }
};

module.exports = async (interaction) => {
  if (!interaction.isButton()) {
    return;
  }

  const customId = interaction.customId;
  let dataChangeRequestCount = loadDataChangeRequestCount(); // Get the current count from the file

  try {
    if (customId.startsWith("confirm_remove_data")) {
      const updatedEmbed = new EmbedBuilder()
        .setColor(0x19e619)
        .setTitle(`Data Removal Request #${dataChangeRequestCount}`)
        .setDescription("Data removal request completed.")
        .setTimestamp();

      await interaction.update({
        components: [],
        embeds: [updatedEmbed],
      });

      console.log(`Data removal request completed by ${interaction.user.tag}.`);
    } else if (customId.startsWith("cancel_remove_data")) {
      const updatedEmbed = new EmbedBuilder()
        .setColor(0x2c2d30)
        .setTitle(`Cancelled: Data Removal Request #${dataChangeRequestCount}`)
        .setDescription("Data removal request cancelled.")
        .setTimestamp();

      await interaction.update({
        components: [],
        embeds: [updatedEmbed],
      });

      console.log(`Data removal request cancelled by ${interaction.user.tag}.`);
    } else if (customId.startsWith("confirm_change_data")) {
      dataChangeRequestCount++; // Increment the count for data change request

      saveDataChangeRequestCount(dataChangeRequestCount); // Save the updated count to the file

      const updatedEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`Data Change Request #${dataChangeRequestCount}`)
        .setDescription("Data change request completed.")
        .setTimestamp();

      await interaction.update({
        components: [],
        embeds: [updatedEmbed],
      });

      console.log(`Data change request completed by ${interaction.user.tag}.`);
    } else if (customId.startsWith("cancel_change_data")) {
      const updatedEmbed = new EmbedBuilder()
        .setColor(0x2c2d30)
        .setTitle(`Cancelled: Data Change Request #${dataChangeRequestCount}`)
        .setDescription("Data change request cancelled.")
        .setTimestamp();

      await interaction.update({
        components: [],
        embeds: [updatedEmbed],
      });

      console.log(`Data change request cancelled by ${interaction.user.tag}.`);
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
