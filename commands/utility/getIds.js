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

    // Loop through usernames and respond for each
    for (const username of usernames) {
      const member = members.find(
        (member) =>
          member.user.username === username || member.displayName === username
      );

      // Respond with only the ID or "Not Found"
      const response = member ? `${member.user.id}` : "Not Found";

      // Send a reply for each username
      await interaction.channel.send(response);
    }

    // Acknowledge the command to prevent interaction timeout
    if (!interaction.replied) {
      await interaction.reply({
        content: "`Processed all usernames from the file.`",
        ephemeral: true,
      });
    }
  },
};
