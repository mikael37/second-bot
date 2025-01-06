const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetnames")
    .setDescription("Resets the nickname of all members to their default username."),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // Defer the interaction to allow time for processing

    const guild = interaction.guild;
    const members = await guild.members.fetch(); // Fetch all members in the guild

    const serverOwnerId = guild.ownerId; // Get the server owner ID
    let resetCount = 0;
    let errorCount = 0;
    const errors = [];

    // Inform the user that the reset process has started
    await interaction.followUp({ content: "Starting to reset nicknames...", ephemeral: true });

    for (const member of members.values()) {
      // Skip bots and the server owner
      if (member.user.bot || member.id === serverOwnerId) {
        continue;
      }

      try {
        await member.setNickname(null); // Reset the nickname to the default username
        resetCount++;
      } catch (nicknameError) {
        errorCount++;
        errors.push(`Error resetting nickname for ${member.user.tag}: ${nicknameError.message}`);
        console.error(`Error resetting nickname for ${member.user.tag}:`, nicknameError);
      }
    }

    // Prepare the final message
    let replyMessage = `Successfully reset nicknames for ${resetCount} members.`;

    if (errorCount > 0) {
      replyMessage += `\nEncountered ${errorCount} errors during nickname reset.`;
      replyMessage += "\n\n **Errors:** \n";
      replyMessage += errors.join("\n");
    }

    // Send the final message
    const finalMessage = await interaction.editReply({ content: replyMessage, ephemeral: true });

    // Delete the message after 10 seconds
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (error) {
        console.error("Error deleting reply:", error);
      }
    }, 10000); // 10,000 milliseconds = 10 seconds
  },
};
