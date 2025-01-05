const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("clearroles")
      .setDescription("Removes specified roles from all members."),
  async execute(interaction) {
      await interaction.deferReply({ ephemeral: true }); // Defer reply for longer operations

      const removeRoleIds = [
          "1323850193312940104", // Example role IDs
          "1323849912508481617",
          "1323849911900442715",
          "1323849904161951794",
          "1323727567613595769",
          "1325568167480918207", // Add other role IDs
          "1325568136543473772"
      ];

      const guild = interaction.guild;
      const members = await guild.members.fetch();

      let removedCount = 0;
      let errorCount = 0;
      const errors = [];

      // Send initial message to indicate the operation has started
      let progressMessage = await interaction.followUp({
          content: "Removing roles... This might take a while.",
          ephemeral: true
      });

      // Remove specified roles from all members using the removeRoleIds array
      for (const roleId of removeRoleIds) {
          console.log(`Starting to remove role: ${roleId}`);

          // Loop through all members and remove the role if they have it
          for (const member of members.values()) {
              try {
                  // Check if the member has the role before attempting to remove it
                  if (member.roles.cache.has(roleId)) {
                      await member.roles.remove(roleId);
                      removedCount++;
                  }
              } catch (roleError) {
                  errorCount++;
                  errors.push(`Error removing role ${roleId} from ${member.user.tag}: ${roleError.message}`);
                  console.error(`Error removing role ${roleId} from ${member.user.tag}:`, roleError);
              }
          }
      }

      // Final status message
      let replyMessage = `Roles removed from ${removedCount} users.`;

      if (errorCount > 0) {
          replyMessage += `\nEncountered ${errorCount} errors during role removal.`;
          replyMessage += "\n\n **Errors:** \n";
          replyMessage += errors.join("\n");
      }

      try {
          // Edit the original message to show completion
          await progressMessage.edit({
              content: replyMessage,
              ephemeral: true
          });
      } catch (err) {
          console.error("Error sending final reply:", err);
      }
  },
};
