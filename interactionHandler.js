async function performSync(interaction, usersData) {
  const guild = interaction.guild;
  const members = await guild.members.fetch();

  const alliancePrefixes = {
    "Shadow Spartans": "SS",
    "Shadow Lumina": "SL",
    "Shadow Eclipse": "SE",
    "Shadow Monarchs": "SC",
    "Shadow Vanguard": "SV",
    "Unaffiliated": "",
    "Migrant": "MIGRANT",
    "Academy / Farm": "",
    "Shadow Death": "SD",
    "None": ""
  };

  const allianceRoleIds = {
    "Shadow Spartans": "1297514305972998204",
    "Shadow Lumina": "1301315222073507860",
    "Shadow Eclipse": "1306716369533800479",
    "Shadow Monarchs": "1297514413263159346",
    "Shadow Vanguard": "1297514368287768606",
    "Unaffiliated": "",
    "Migrant": "1325565433348227212",
    "Academy / Farm": "",
    "Shadow Death": "",
    "None": ""
  };

  const kingdomRoleId = "1310229163847974982"; // Kingdom role ID
  const syncExclusionRoleId = "1325565234894733414"; // Sync-Exclusion role ID
  const statusMessages = [];
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  await interaction.editReply({
    content: "Proceeding to rename users and assign new roles.",
    ephemeral: true,
  });

  console.log("Assigning roles and renaming users...");
  const batchSize = 10; // Process 10 users at a time

  for (let i = 0; i < usersData.length; i += batchSize) {
    const batch = usersData.slice(i, i + batchSize);

    for (const user of batch) {
      const member = members.get(user.discordId);
      if (!member || member.user.bot || member.id === guild.ownerId || member.roles.cache.has(syncExclusionRoleId)) {
        statusMessages.push(`The user with ID <@${user.discordId}> could not be located within the guild's members or is excluded.`);
        continue;
      }

      try {
        const prefix = alliancePrefixes[user.alliance] || "";
        const newNickname = `[${prefix}] ${user.inGameUsername}`;
        await member.setNickname(newNickname);

        const roleId = allianceRoleIds[user.alliance];
        
        // Check if the role ID is empty or not
        if (roleId === "") {
          // If no role ID for this alliance, only assign Kingdom role
          if (!member.roles.cache.has(kingdomRoleId)) {
            await member.roles.add(kingdomRoleId);
            statusMessages.push(`User: <@${member.user.id}> has been assigned the Kingdom role only.`);
          }
        } else {
          // If role ID exists, assign the alliance role and possibly the Kingdom role
          await member.roles.add(roleId);
          
          // Only add kingdom role if the user does not have the "Migrant" or "Unaffiliated" role
          const hasMigrantRole = member.roles.cache.has(allianceRoleIds["Migrant"]);
          if (!hasMigrantRole) {
            await member.roles.add(kingdomRoleId);
          }

          statusMessages.push(`User: <@${member.user.id}> has been successfully renamed and assigned <@&${roleId}>`);
        }

      } catch (userError) {
        console.error(`Error updating ${user.discordId}:`, userError);
        statusMessages.push(`An error occurred while updating the user with ID <@${user.discordId}>.`);
      }
    }

    await interaction.editReply({
      content: `Processed ${i + batchSize} of ${usersData.length} users so far...`,
      ephemeral: true,
    });

    await delay(100); // Delay between batches to avoid hitting rate limits
  }

  console.log("Sync complete, sending final message...");
  // Break status messages into smaller chunks to avoid exceeding Discord's limit
  await sendChunks(interaction, statusMessages);
}
