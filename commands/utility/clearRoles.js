const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearroles')
    .setDescription('Clears roles from users listed in the userData.json file.')
    .addStringOption(option =>
      option.setName('file')
        .setDescription('The path to the JSON file with Discord IDs to clear roles from.')
        .setRequired(true)), // File argument is required
  async execute(interaction) {
    // Check if the user has the correct permissions
    if (!interaction.member.permissions.has('MANAGE_ROLES')) {
      return interaction.reply({
        content: 'You do not have permission to manage roles.',
        ephemeral: true,
      });
    }

    // Get the file path from the options
    const filePath = interaction.options.getString('file');

    // Check if the file exists and parse the data
    let userData;
    try {
      userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      return interaction.reply({
        content: 'There was an error reading the file or parsing its content.',
        ephemeral: true,
      });
    }

    // Get the guild members
    const guildMembers = await interaction.guild.members.fetch();
    const roleRemovalPromises = [];
    const failedUsers = [];

    // Iterate through the userData (which should contain Discord IDs)
    userData.forEach((user) => {
      const guildMember = guildMembers.get(user.discordId);
      if (!guildMember) {
        failedUsers.push(user.discordId); // Add failed users to the list
        return;
      }

      // Filter out @everyone role
      const rolesToClear = guildMember.roles.cache.filter(
        (role) => role.id !== interaction.guild.id // Exclude @everyone role
      );

      if (rolesToClear.size === 0) {
        failedUsers.push(user.discordId); // Add to failed list if no roles found
      } else {
        // Add role removal promise to the list
        roleRemovalPromises.push(
          guildMember.roles.remove(rolesToClear).catch((error) => {
            console.error('Error clearing roles for', guildMember.user.tag, error);
            failedUsers.push(user.discordId);
          })
        );
      }
    });

    // Wait for all role removals to complete
    await Promise.all(roleRemovalPromises);

    // Send a success/failure message
    if (failedUsers.length > 0) {
      return interaction.reply({
        content: `Roles could not be cleared for the following users: ${failedUsers.join(', ')}`,
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: 'Roles have been successfully cleared from the specified users.',
      ephemeral: true,
    });
  },
};
