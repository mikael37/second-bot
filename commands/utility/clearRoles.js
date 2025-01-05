const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearroles")
    .setDescription("Removes specified roles from all members."),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // Defer the interaction to allow time for processing

    const removeRoleIds = [
      "1323850193312940104",
      "1323849912508481617",
      "1323849911900442715",
      "1323849904161951794",
      "1323727567613595769",
      "1325568167480918207",
      "1325568136543473772",
      "1325568167480918207",
      "1325568167480918207",
      "1324055858786861077"
    ];

    const guild = interaction.guild;
    const members = await guild.members.fetch(); // Fetch all members in the guild

    let removedCount = 0;
    let errorCount = 0;
    const errors = [];

    // Inform the user that the removal process has started
    await interaction.followUp({ content: "Starting to remove roles...", ephemeral: true });

    for (const member of members.values()) {
      for (const roleId of removeRoleIds) {
        if (member.roles.cache.has(roleId)) { // Check if the user has the role
          try {
            await member.roles.remove(roleId); // Remove the role
            removedCount++;
          } catch (roleError) {
            errorCount++;
            errors.push(`Error removing role ${roleId} from ${member.user.tag}: ${roleError.message}`);
            console.error(`Error removing role ${roleId} from ${member.user.tag}:`, roleError);
          }
        }
      }
    }

    // Prepare the final message
    let replyMessage = `Successfully removed roles from ${removedCount} roles across members.`;

    if (errorCount > 0) {
      replyMessage += `\nEncountered ${errorCount} errors during role removal.`;
      replyMessage += "\n\n **Errors:** \n";
      replyMessage += errors.join("\n");
    }

    // Send the final message
    await interaction.editReply({ content: replyMessage, ephemeral: true });
  },
};
