const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearroles')
    .setDescription('Clears specific roles for users listed in a specified file.')
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

    // Define the roles to be removed
    const rolesToRemove = [
      "1297514305972998204", // Shadow Spartans
      "1301315222073507860", // Shadow Lumina
      "1306716369533800479", // Shadow Eclipse
      "1297514413263159346", // Shadow Monarchs
      "1297514368287768606", // Shadow Vanguard
      "1325568167480918207", // Unaffiliated
      "1325565433348227212", // Migrant
      "1325567866073911400", // None
      "", // Shadow Death (if it has an ID)
      "", // Academy / Farm (no ID provided)
    ];

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

      // Get the roles of the member to be removed (matching the provided list)
      const rolesToRemoveFromMember = member.roles.cache.filter(role =>
        rolesToRemove.includes(role.id) || (role.name === 'Academy / Farm' && role.id === '') // Special check for Academy / Farm with no ID
      );

      if (rolesToRemoveFromMember.size === 0) {
        statusMessages.push(`<@${id}> has no matching roles to clear.`);
        continue;
      }

      try {
        // Remove the specified roles from the member
        await member.roles.remove(rolesToRemoveFromMember);
        statusMessages.push(`Removed specified roles from <@${id}>.`);
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
