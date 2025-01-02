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
    "The Rumbling": "TR",
    "Yeagerists": "YG",
    "Shiganshina's Hope": "SH",
    "The Survey Corps": "SC",
    "Devils of Paradis": "DP",
  };

  const allianceRoleIds = {
    "The Rumbling": "1323727567613595769",
    "Yeagerists": "1301315222073507860",
    "Shiganshina's Hope": "1323850193312940104",
    "The Survey Corps": "1323849911900442715",
    "Devils of Paradis": "1323849912508481617",
  };

  const kingdomRoleId = "1324055858786861077";

  const statusMessages = [];

  for (const user of usersData) {
    const member = members.get(user.discordId);
    if (!member) {
      statusMessages.push(`User: <@${user.discordId}> not found.`);
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
        statusMessages.push(`User: ${member.user.tag} renamed and assigned role "${user.alliance}".`);
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
