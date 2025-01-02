const { users, config } = require("./userData");

async function performSync(interaction) {
  const guild = interaction.guild;
  const members = await guild.members.fetch();

  const { alliancePrefixes, allianceRoleIds, kingdomRoleId } = config;

  const statusMessages = [];

  for (const user of users) {
    const member = members.get(user.discordId);
    if (!member) {
      statusMessages.push(`User with ID ${user.discordId} not found.`);
      continue;
    }

    try {
      const prefix = alliancePrefixes[user.alliance] || "XX";
      const newNickname = `[${prefix}05] ${user.inGameUsername}`;
      await member.setNickname(newNickname);

      const roleId = allianceRoleIds[user.alliance];
      if (roleId) {
        await member.roles.add(roleId);
        await member.roles.add(kingdomRoleId);
        statusMessages.push(`Updated ${member.user.tag}: Renamed and assigned role "${user.alliance}".`);
      } else {
        statusMessages.push(`Role for alliance "${user.alliance}" not found. Skipping role assignment.`);
      }
    } catch (userError) {
      console.error(`Error updating ${user.discordId}:`, userError);
      statusMessages.push(`Failed to update user with ID ${user.discordId}.`);
    }
  }

  await interaction.editReply(statusMessages.join("\n"));
}
