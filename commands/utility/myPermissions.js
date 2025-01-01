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
    const column1 = permissionList.slice(0, midIndex).join("\n");
    const column2 = permissionList.slice(midIndex).join("\n");

    // Combine both columns with a separator
    const formattedMessage = `${column1}\n\n${column2}`;

    // If no permissions, display a default message
    const message = formattedMessage || "`No permissions`";

    // Send the formatted permission list as a reply
    await interaction.reply(`The bot has the following permissions in this channel:\n${message}`);
  },
};
