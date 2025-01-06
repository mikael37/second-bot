const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearroles')
    .setDescription('Clears roles from a specified user or all users.'),
  async execute(interaction) {
    // Check if the user has the correct permissions (optional)
    if (!interaction.member.permissions.has('MANAGE_ROLES')) {
      return interaction.reply({
        content: 'You do not have permission to manage roles.',
        ephemeral: true,
      });
    }

    // Get the user to clear roles from (if provided)
    const user = interaction.options.getUser('user');
    const guildMember = interaction.guild.members.cache.get(user.id);

    if (!guildMember) {
      return interaction.reply({
        content: 'User not found in this guild.',
        ephemeral: true,
      });
    }

    // Get the list of roles to clear (or clear all roles except @everyone)
    const rolesToClear = guildMember.roles.cache.filter(
      (role) => role.id !== interaction.guild.id // Keep @everyone role
    );

    if (rolesToClear.size === 0) {
      return interaction.reply({
        content: 'This user has no roles to clear.',
        ephemeral: true,
      });
    }

    // Remove roles from the user
    try {
      await guildMember.roles.remove(rolesToClear);
      return interaction.reply({
        content: `Successfully cleared roles from ${guildMember.user.tag}.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error clearing roles:', error);
      return interaction.reply({
        content: 'An error occurred while clearing roles.',
        ephemeral: true,
      });
    }
  },
};
