const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mypermissions")
    .setDescription("Lists all the bot's permissions in the current channel."),
  async execute(interaction) {
    // Ensure the bot is fully available
    const botMember = await interaction.guild.members.fetchMe();

    // Get the bot's permissions in the current channel
    const permissions = botMember.permissionsIn(interaction.channel);

    // Define a list of low-danger permissions to filter out
    const lowDangerPermissions = [
      "UseExternalSounds", "SendPolls", "UseExternalApps", "UseEmbeddedActivities", 
      "UseSoundboard", "UseExternalStickers", "SendMessagesInThreads", 
      "CreateGuildExpressions", "CreateEvents", "SendVoiceMessages", 
      "CreatePublicThreads", "CreatePrivateThreads", "UseVAD", "ModerateMembers", 
      "ViewCreatorMonetizationAnalytics", "ViewGuildInsights"
    ];

    // Filter out low-danger permissions
    const filteredPermissions = permissions.toArray().filter(permission => 
      !lowDangerPermissions.includes(permission)
    );

    // Create a formatted string of the remaining permissions
    const permissionList = filteredPermissions.length > 0
      ? filteredPermissions.map(permission => `\`${permission}\``).join("\n")
      : "`No permissions`";

    // Send the formatted permission list as a reply
    await interaction.reply(`The bot has the following permissions in this channel:\n${permissionList}`);
  },
};
