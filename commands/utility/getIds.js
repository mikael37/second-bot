const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("getidsfromfile")
    .setDescription("Get Discord IDs for usernames listed in a file"),
  async execute(interaction) {
    // Path to the file containing usernames
    const filePath = path.join(__dirname, "../../usernames.txt");

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return await interaction.reply({
        content: "`Error: usernames.txt file not found.`",
        ephemeral: true,
      });
    }

    // Read the usernames from the file
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const usernames = fileContent.split("\n").map((name) => name.trim());

    if (usernames.length === 0) {
      return await interaction.reply({
        content: "`Error: No usernames found in the file.`",
        ephemeral: true,
      });
    }

    // Fetch all members of the guild
    const guild = interaction.guild;
    const members = await guild.members.fetch();

    // Create an array to store results in the same order as usernames
    const results = [];

    for (const username of usernames) {
      // Find member by exact username or displayName (case-sensitive)
      const member = members.find(
        (member) =>
          member.user.username === username || member.displayName === username
      );

      // Add result to the array
      results.push(member ? `${member.user.id}` : "Not Found");
    }

    // Send the results in a single message to ensure order
    const response = results.join("\n");
    await interaction.reply({
      content: `\`\`\`\n${response}\n\`\`\``,
    });
  },
};
