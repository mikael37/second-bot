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
          // Add other role IDs here
      ];

      const guild = interaction.guild;
      const members = await guild.members.fetch();

      let removedCount = 0;
      let errorCount = 0;
      const errors = [];

      // Send the initial "removal in progress" message
      const progressMessage = await interaction.followUp({
          content: "Removing roles from members... Please wait.",
          ephemeral: true
      });

      // Loop through all roles and remove them from members
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

      // Create the final summary message
      let replyMessage = `Roles removal completed! Removed roles from ${removedCount} users.`;

      if (errorCount > 0) {
          replyMessage += `\nEncountered ${errorCount} errors during role removal.`;
          replyMessage += "\n\n**Errors:**\n";
          replyMessage += errors.join("\n");
      }

      try {
          // Send the final summary message
          await interaction.editReply({
              content: replyMessage,
              ephemeral: true
          });
      } catch (err) {
          console.error("Error sending final reply:", err);
      }
  },
};
