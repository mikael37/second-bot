const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("syncdatabase")
    .setDescription("Assign roles and rename users in bulk."),
  async execute(interaction) {
    try {
      // Load user data from JSON file
      const usersData = JSON.parse(fs.readFileSync("userData.json"));

      // Defer the reply to allow processing time
      await interaction.deferReply();

      const guild = interaction.guild;

      // Fetch all members in one request
      const members = await guild.members.fetch();

      // Define a mapping of alliances to prefixes
      const alliancePrefixes = {
        "The Rumbling": "TR",
        "Yeagerists": "YG",
        "Shiganshina's Hope": "SH",
        "The Survey Corps": "SC",
        "Devils of Paradis": "DP",
      };

      // Define a mapping of alliances to role IDs
      const allianceRoleIds = {
        "The Rumbling": "1323727567613595769", // Replace with actual role IDs
        "Yeagerists": "1323849904161951794",
        "Shiganshina's Hope": "1323850193312940104",
        "The Survey Corps": "1323849911900442715",
        "Devils of Paradis": "1323849912508481617",
      };

      const kingdomRoleId = "1324055858786861077"

      // Process each user
      const statusMessages = [];
      for (const user of usersData) {
        const member = members.get(user.discordId);

        if (!member) {
          statusMessages.push('`User with ID ${user.discordId} not found.`');
          continue;
        }

        try {
          // Get the prefix for the user's alliance, or use a default if not found
          const prefix = alliancePrefixes[user.alliance] || "XX";

          // Rename the user with the appropriate prefix
          const newNickname = `[${prefix}05] ${user.inGameUsername}`;
          await member.setNickname(newNickname);

          // Assign the role using the allianceRoleIds map
          const roleId = allianceRoleIds[user.alliance];
          if (roleId) {
            await member.roles.add(roleId); member.roles.add(kingdomRoleId)
            statusMessages.push(
              '`Updated ${member.user.tag}: Renamed and assigned role "${user.alliance}".`'
            );
          } else {
            statusMessages.push(
              '`Role for alliance "${user.alliance}" not found. Skipping role assignment.`'
            );
          }
        } catch (userError) {
          console.error('`Error updating ${user.discordId}:`', userError);
          statusMessages.push('`Failed to update user with ID ${user.discordId}.`');
        }
      }

      // Respond with a summary
      await interaction.editReply(statusMessages.join("\n"));
    } catch (error) {
      console.error("Bulk assignment failed:", error);
      await interaction.editReply('`An error occurred while assigning roles in bulk.`');
    }
  },
};