const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearroles')
    .setDescription('Clears roles for users listed in a specified file.')
    .addStringOption(option =>
      option
        .setName('file')
        .setDescription("Specify 'file' to only clear roles for users listed in usernames.txt.")
        .setRequired(false)
    ),

  async execute(interaction) {
    const useFile = interaction.options.getString('file');
    const guild = interaction.guild;
    const members = await guild.members.fetch();
    const statusMessages = [];
    const syncExclusionRoleId = '1325565234894733414'; // Sync-Exclusion role ID

    // If 'file' option is provided, read the file for user IDs
    let userIds = [];
    if (useFile === 'file') {
      try {
        const fileContent = fs.readFileSync('usernames.txt', 'utf-8');
        userIds = fileContent.split(/\s+/).filter(Boolean); // Split by whitespace and filter out empty strings
      } catch (error) {
        console.error('Error reading usernames.txt:', error);
        await interaction.reply({
          content: 'Failed to read usernames.txt. Ensure the file exists and is formatted correctly.',
          ephemeral: true,
        });
        return;
      }
    }

    await interaction.reply({
      content: "Clearing roles... This may take some time for large servers.",
      ephemeral: true,
    });

    for (const [id, member] of members) {
      // Skip bots, the server owner, members with the Sync-Exclusion role, and members not in the file if 'file' option is used
      if (
        member.user.bot ||
        id === guild.ownerId ||
        member.roles.cache.has(syncExclusionRoleId) || // Skip if member has the Sync-Exclusion role
        (userIds.length > 0 && !userIds.includes(id.toString())) // Ensure id is a string before checking
      ) {
        continue;
      }

      // Get roles to remove (excluding @everyone)
      const rolesToClear = member.roles.cache.filter(
        (role) => role.id !== interaction.guild.id // Exclude @everyone role
      );

      if (rolesToClear.size === 0) {
        statusMessages.push(`<@${id}> has no roles to clear.`);
        continue;
      }

      try {
        // Remove roles from the member
        await member.roles.remove(rolesToClear);
        statusMessages.push(`Cleared roles for <@${id}>.`);
      } catch (error) {
        console.error(`Failed to clear roles for <@${id}>:`, error);
        statusMessages.push(`Error clearing roles for <@${id}>.`);
      }
    }

    await interaction.editReply({
      content: `Role clearing completed.\n\n${statusMessages.slice(0, 10).join("\n")}${
        statusMessages.length > 10 ? "\n...and more." : ""
      }`,
      ephemeral: true,
    });

    // Log remaining status messages (optional)
    console.log(statusMessages.join("\n"));
  },
};
