const { SlashCommandBuilder } = require("discord.js");
const { google } = require("googleapis");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("spreadsheet-info")
    .setDescription("Get general information about the Google Spreadsheet"),

  async execute(interaction) {
    // Path to the service account credentials file
    const keyFile = path.join(__dirname, '54b3b8.json');

    // Spreadsheet ID (from the URL of your Google Sheet)
    const spreadsheetId = "15eNCa6N_GCLXXbuFjSnjPaUDLlHscEnaKmV80KbQ0vg"; // Replace with your sheet ID

    // Authenticate with the service account
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Read-only access
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
      // Get spreadsheet metadata (including sheet names, number of rows, columns, etc.)
      const res = await sheets.spreadsheets.get({
        spreadsheetId,
      });

      // Extract relevant details from the spreadsheet metadata
      const spreadsheet = res.data;
      const title = spreadsheet.properties.title;
      const sheetsList = spreadsheet.sheets.map(sheet => sheet.properties.title).join(", ");
      const sheetCount = spreadsheet.sheets.length;

      // Build the embed to show spreadsheet info
      const embed = {
        color: 0x0099ff,
        title: `Google Spreadsheet Information`,
        description: `Here is the general information about the spreadsheet:`,
        fields: [
          {
            name: "Spreadsheet Title",
            value: title,
            inline: true,
          },
          {
            name: "Number of Sheets",
            value: `${sheetCount}`,
            inline: true,
          },
          {
            name: "Sheets in the Spreadsheet",
            value: sheetsList,
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
