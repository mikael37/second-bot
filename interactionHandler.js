const fs = require("fs");

module.exports = async (interaction) => {
  if (!interaction.isButton()) {
    return;
  }

  const { customId } = interaction; // Extract customId from the interaction

  try {
    if (customId === "confirmSync") {
      // Proceed with syncing the database
      await interaction.update({
        content: "The database synchronization process is currently in progress. Please be patient as updates are applied.",
        components: [], // Remove buttons after confirmation
        ephemeral: true,
      });

      // Get user data from JSON file
      const usersData = JSON.parse(fs.readFileSync("userData.json"));

      // Perform the sync operation
      console.log("Starting the synchronization process..."); // Added logging
      await performSync(interaction, usersData);

    } else if (customId === "cancelSync") {
      // Cancel the sync operation
      await interaction.update({
        content: "The synchronization operation has been canceled at the request of <@" + interaction.user.id + ">. No further changes have been made.",
        components: [], // Remove buttons after cancellation
        ephemeral: true,
      });

      console.log(`Sync operation canceled by ${interaction.user.tag}.`);
    }
  } catch (error) {
    console.error("Error processing interaction:", error); // More detailed logging
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "An error occurred while processing the interaction.",
        ephemeral: true,
      });
    }
  }
};

// Function to perform the sync operation
// Function to perform the sync operation
async function performSync(interaction, usersData) {
  const guild = interaction.guild;
  const members = await guild.members.fetch();

  const alliancePrefixes = {
    "Shadow Spartans": "SS",
    "Shadow Lumina": "SL",
    "Shadow Eclipse": "SE",
    "Shadow Monarchs": "SC",
    "Shadow Vanguard": "SV",
  };

  const allianceRoleIds = {
    "Shadow Spartans": "1323850193312940104",
    "Shadow Lumina": "1323849912508481617",
    "Shadow Eclipse": "1323849911900442715",
    "Shadow Monarchs": "1323849904161951794",
    "Shadow Vanguard": "1323727567613595769",
    "Unaffiliated": "1325568167480918207",
    "Migrant": "1325568136543473772",
    "Academy": "1325568167480918207",
    "Shadow Death": "1325568167480918207",
  };

  const kingdomRoleId = "1324055858786861077";  // Kingdom role ID
  const statusMessages = [];

  // Send initial progress update
  await interaction.editReply({
    content: "Proceeding to rename users and assign new roles.",
    ephemeral: true,
  });

  // Proceed with syncing (nickname changes and role assignments)
  console.log("Assigning roles and renaming users..."); // Added logging
  for (const user of usersData) {
    const member = members.get(user.discordId);
    if (!member) {
      statusMessages.push(`The user with ID <@${user.discordId}> could not be located within the guild's members.`);
      continue;
    }

    try {
      const prefix = alliancePrefixes[user.alliance] || "XX";
      const newNickname = `[${prefix}] ${user.inGameUsername}`;
      await member.setNickname(newNickname);

      const roleId = allianceRoleIds[user.alliance];
      if (roleId) {
        await member.roles.add(roleId);
        
        // Only add kingdom role if the user does not have the "Migrant" or "Unaffiliated" role
        const hasMigrantRole = member.roles.cache.has(allianceRoleIds["Migrant"]);
        const hasUnaffiliatedRole = member.roles.cache.has(allianceRoleIds["Unaffiliated"]);
        
        if (!hasMigrantRole && !hasUnaffiliatedRole) {
          await member.roles.add(kingdomRoleId);
        }

        statusMessages.push(`User: <@${member.user.id}> has been successfully renamed and assigned <@&${roleId}>`);
      } else {
        statusMessages.push(`The alliance role '${user.alliance}' was not found in the database. The role assignment for this user has been skipped.`);
      }
    } catch (userError) {
      console.error(`Error updating ${user.discordId}:`, userError);
      statusMessages.push(`An error occurred while updating the user with ID <@${user.discordId}>.`);
    }
  }

  // Send the final status message (ephemeral)
  console.log("Sync complete, sending final message..."); // Added logging
  await interaction.editReply({
    content: statusMessages.join("\n"),
    ephemeral: true,
  });
}
