const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearroles")
    .setDescription("Removes specified roles from all members or specific members from a file.")
    .addStringOption(option =>
      option
        .setName("file")
        .setDescription("Specify 'file' to only remove roles for users listed in usernames.txt.")
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // Defer the interaction to allow time for processing

    const useFile = interaction.options.getString("file");
    const removeRoleIds = [
      "1323850193312940104",
      "1323849912508481617",
      "1323849911900442715",
      "1323849904161951794",
      "1323727567613595769",
      "1325568167480918207",
      "1325568136543473772",
      "1324055858786861077"
    ];

    const guild = interaction.guild;
    const members = await guild.members.fetch(); // Fetch all members in the guild
    const statusMessages = [];

    // If 'file' option is provided, read the file for user IDs
    let userIds = [];
    if (useFile === "file") {
      try {
        const fileContent = fs.readFileSync("usernames.txt", "utf-8");
        userIds = fileContent.split(/\s+/).filter(Boolean); // Split by whitespace and filter out empty strings
      } catch (error) {
        console.error("Error reading usernames.txt:", error);
        await interaction.editReply({
          content: "Failed to read usernames.txt. Ensure the file exists and is formatted correctly.",
          ephemeral: true,
        });
        return;
      }
    }

    let removedRolesCount = 0;
    let affectedMembersCount = 0;

    // Inform the user that the removal process has started
    await interaction.followUp({ content: "Starting to remove roles...", ephemeral: true });

    for (const member of members.values()) {
      // Skip members not in the file if 'file' option is used
      if (userIds.length > 0 && !userIds.includes(member.id)) {
        continue;
      }

      let memberRoleRemoved = false;

      for (const roleId of removeRoleIds) {
        if (member.roles.cache.has(roleId)) { // Check if the user has the role
          try {
            await member.roles.remove(roleId); // Remove the role
            removedRolesCount++;
            memberRoleRemoved = true;
          } catch (roleError) {
            console.error(`Error removing role ${roleId} from ${member.user.tag}:`, roleError);
          }
        }
      }

      if (memberRoleRemoved) {
        affectedMembersCount++;
      }
    }

    // Prepare the final message
    let replyMessage = `Successfully removed ${removedRolesCount} roles from ${affectedMembersCount} members.`;

    // Send the final status message (ephemeral)
    await interaction.editReply({
      content: replyMessage,
      ephemeral: true,
    });

    // Log the final status message (optional)
    console.log(replyMessage);
  },
};
