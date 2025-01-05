const { EmbedBuilder } = require("discord.js");

module.exports = async (interaction) => {
  if (!interaction.isButton()) {
    return;
  }

  const { customId } = interaction; // Extract customId from the interaction

  try {
    if (customId === "confirmSync") {
      // Proceed with syncing the database
      await interaction.update({
        content: "Syncing database...",
        components: [], // Remove buttons after confirmation
      });

      // Get user data from JSON file
      const usersData = JSON.parse(require("fs").readFileSync("userData.json"));

      // Perform the sync operation
      await performSync(interaction, usersData);

    } else if (customId === "cancelSync") {
      // Cancel the sync operation
      await interaction.update({
        content: "Sync operation canceled.",
        components: [], // Remove buttons after cancellation
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
async function performSync(interaction, usersData) {
  const guild = interaction.guild;
  const members = await guild.members.fetch();

  const alliancePrefixes = {
    "Shadow Spartans": "SS",
    "Shadow Lumina": "SL",
    "Shadow Eclipse": "SE",
    "Shadow Monarchs": "SC",
    "Shadow Vanguard": "SV"
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
    "Shadow Death" : "1325568167480918207"
  };

  const kingdomRoleId = "1324055858786861077";

  const statusMessages = [];

  // Remove the specified roles from all members
  for (const roleId of Object.values(allianceRoleIds)) {
    for (const member of members.values()) {
      try {
        await member.roles.remove(roleId);
      } catch (roleError) {
        console.error(`Error removing role ${roleId} from ${member.user.tag}:`, roleError);
      }
    }
  }

  // Proceed with syncing (nickname changes and role assignments)
  for (const user of usersData) {
    const member = members.get(user.discordId);
    if (!member) {
      statusMessages.push(`User: <@${user.discordId}> not found.`);
      continue;
    }

    try {
      const prefix = alliancePrefixes[user.alliance] || "XX";
      const newNickname = `[${prefix}] ${user.inGameUsername}`;
      await member.setNickname(newNickname);

      const roleId = allianceRoleIds[user.alliance];
      if (roleId) {
        await member.roles.add(roleId);
        await member.roles.add(kingdomRoleId);
        statusMessages.push(`User: <@${member.user.tag}> renamed and assigned role "${user.alliance}".`);
      } else {
        statusMessages.push(`Alliance role: "${user.alliance}" not found. Skipping role assignment.`);
      }
    } catch (userError) {
      console.error(`Error updating ${user.discordId}:`, userError);
      statusMessages.push(`Failed to update user: <@${user.discordId}>.`);
    }
  }

  await interaction.editReply(statusMessages.join("\n"));
}
