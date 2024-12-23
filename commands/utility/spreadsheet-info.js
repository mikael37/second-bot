const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("spreadsheet-info")
    .setDescription("Get general information about the Google Spreadsheet"),

  async execute(interaction) {
    const sheetDBUrl = process.env.SHEETDB_API_URL; // Your SheetDB API URL

    try {
      // Fetch data from the SheetDB API
      const response = await fetch(sheetDBUrl);
      const data = await response.json();

      // Get the number of rows and columns
      const rowCount = data.length;
      const columnCount = data[0] ? Object.keys(data[0]).length : 0;

      // Build the embed to show spreadsheet info
      const embed = {
        color: 0x0099ff,
        title: `Google Spreadsheet Information`,
        description: `Here is the general information about the spreadsheet:`,
        fields: [
          {
            name: "Number of Rows",
            value: `${rowCount}`,
            inline: true,
          },
          {
            name: "Number of Columns",
            value: `${columnCount}`,
            inline: true,
          },
          {
            name: "Spreadsheet Data Preview",
            value: `First row data: ${JSON.stringify(data[0])}`,
            inline: false,
          },
        ],
        timestamp: new Date(),
      };

      // Send the embed as a reply
      await interaction.reply({
        content: "Here's the information about the Google Spreadsheet:",
        embeds: [embed],
      });
    } catch (error) {
      console.error("Error fetching spreadsheet info:", error);
      await interaction.reply({
        content: "There was an error while fetching the spreadsheet information.",
        ephemeral: true,
      });
    }
  },
};
