const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("syncdatabase")
    .setDescription("Assign roles and rename users in bulk."),

  async execute(interaction) {
    try {
      // Read user data from the JSON file
      const userDataPath = path.join(__dirname, "../../userData.json");
      const rawData = fs.readFileSync(userDataPath, "utf-8");

      // Parse the JSON data
      const users = JSON.parse(rawData);

      // Check if users is an array
      if (!Array.isArray(users)) {
        throw new Error("User data is not an array.");
      }

      // Static configuration for roles and prefixes
      const alliancePrefixes = {
        "The Rumbling": "TR",
        "Yeagerists": "YG",
        "Shiganshina's Hope": "SH",
        "The Survey Corps": "SC",
        "Devils of Paradis": "DP",
      };

      const allianceRoleIds = {
        "The Rumbling": "1323727567613595769",
        "Yeagerists": "1323849904161951794",
        "Shiganshina's Hope": "1323850193312940104",
        "The Survey Corps": "1323849911900442715",
        "Devils of Paradis": "1323849912508481617",
      };

      const kingdomRoleId = "1324055858786861077"; // Static kingdom role ID

      const guild = interaction.guild;
      const members = await guild.members.fetch();

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
    } catch (error) {
      console.error("Bulk assignment failed:", error);
      await interaction.editReply("An error occurred while assigning roles in bulk.");
    }
  },
};
