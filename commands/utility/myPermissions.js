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

    // Create an array of permissions formatted as "`permission`"
    const permissionList = permissions.toArray().map(permission => `\`${permission}\``);

    // Split the permissions into two columns
    const midIndex = Math.ceil(permissionList.length / 2);
    const column1 = permissionList.slice(0, midIndex);
    const column2 = permissionList.slice(midIndex);

    // Format the two columns to align vertically
    let formattedMessage = "";
    const maxLength = Math.max(column1.length, column2.length);

    for (let i = 0; i < maxLength; i++) {
      // Add each permission from column1, and align with column2
      const col1 = column1[i] || ""; // Add empty if column1 is shorter
      const col2 = column2[i] || ""; // Add empty if column2 is shorter
      formattedMessage += `${col1.padEnd(35)} ${col2}\n`;
    }

    // If no permissions, display a default message
    const message = formattedMessage || "`No permissions`";

    // Send the formatted permission list as a reply
    await interaction.reply(`The bot has the following permissions in this channel:\n${message}`);
  },
};
