const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearname")
    .setDescription("Clear nicknames for all members or specific members from a file.")
    .addStringOption(option =>
      option
        .setName("file")
        .setDescription("Specify 'file' to only clear nicknames for users listed in usernames.txt.")
        .setRequired(false)
    ),

  async execute(interaction) {
    const useFile = interaction.options.getString("file");
    const guild = interaction.guild;
    const members = await guild.members.fetch();
    const statusMessages = [];
    const syncExclusionRoleId = "1325565234894733414"; // Sync-Exclusion role ID

    // If 'file' option is provided, read the file for user IDs
    let userIds = [];
    if (useFile === "file") {
      try {
        const fileContent = fs.readFileSync("usernames.txt", "utf-8");
        userIds = fileContent.split(/\s+/).filter(Boolean); // Split by whitespace and filter out empty strings
      } catch (error) {
        console.error("Error reading usernames.txt:", error);
        await interaction.reply({
          content: "Failed to read usernames.txt. Ensure the file exists and is formatted correctly.",
          ephemeral: true,
        });
        return;
      }
    }

    await interaction.reply({
      content: "Clearing nicknames... This may take some time for large servers.",
      ephemeral: true,
    });

    for (const [id, member] of members) {
      // Skip bots, the server owner, members with the Sync-Exclusion role, and members not in the file if 'file' option is used
      if (
        member.user.bot ||
        id === guild.ownerId ||
        member.roles.cache.has(syncExclusionRoleId) || // Skip if member has the Sync-Exclusion role
        (userIds.length > 0 && !userIds.includes(id.toString())) // Ensure id is a string before checking
      ) {
        continue;
      }

      try {
        if (member.nickname) {
          await member.setNickname(null);
          statusMessages.push(`Cleared nickname for <@${id}>.`);
        } else {
          statusMessages.push(`<@${id}> already has no nickname.`);
        }
      } catch (error) {
        console.error(`Failed to clear nickname for <@${id}>:`, error);
        statusMessages.push(`Error clearing nickname for <@${id}>.`);
      }
    }

    await interaction.editReply({
      content: `Nickname clearing completed.\n\n${statusMessages.slice(0, 10).join("\n")}${
        statusMessages.length > 10 ? "\n...and more." : ""
      }`,
      ephemeral: true,
    });

    // Log remaining status messages (optional)
    console.log(statusMessages.join("\n"));
  },
};
