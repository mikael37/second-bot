const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bulkassignroles")
    .setDescription("Assign roles and rename users in bulk."),
  async execute(interaction) {
    try {
      // Load user data from JSON file
      const usersData = JSON.parse(fs.readFileSync("usersData.json"));

      // Defer the reply to allow processing time
      await interaction.deferReply();

      const guild = interaction.guild;

      // Fetch all members in one request
      const members = await guild.members.fetch();

      // Cache roles to avoid repeated API calls
      const existingRoles = new Map(
        guild.roles.cache.map((role) => [role.name, role])
      );

      // Define a mapping of alliances to prefixes
      const alliancePrefixes = {
        "The Rumbling": "[TR05]",
        "Yeagerists": "[YG05]",
        "Shiganshina's Hope": "[SH05]",
        "The Survery Corps": "[SC05]"
      };

      // Process each user
      const statusMessages = [];
      for (const user of usersData) {
        const member = members.get(user.discordId);

        if (!member) {
          statusMessages.push(`User with ID ${user.discordId} not found.`);
          continue;
        }

        try {
          // Get the prefix for the user's alliance, or use a default if not found
          const prefix = alliancePrefixes[user.alliance] || "[XX05]";

          // Rename the user with the appropriate prefix
          const newNickname = `[${prefix}05] ${user.inGameUsername}`;
          await member.setNickname(newNickname);

          // Find or create the alliance role
          let role = existingRoles.get(user.alliance);
          if (!role) {
            role = await guild.roles.create({
              name: user.alliance,
              color: "BLUE", // Customize if needed
              reason: `Created for ${user.alliance}`,
            });
            existingRoles.set(user.alliance, role);
          }

          // Assign the role
          await member.roles.add(role);
          statusMessages.push(`Updated ${member.user.tag}: Renamed and assigned role "${user.alliance}".`);
        } catch (userError) {
          console.error(`Error updating ${user.discordId}:`, userError);
          statusMessages.push(`Failed to update user with ID ${user.discordId}.`);
        }
      }

      // Respond with a summary
      await interaction.editReply(statusMessages.join("\n"));
    } catch (error) {
      console.error("Bulk assignment failed:", error);
      await interaction.editReply("An error occurred while assigning roles in bulk.");
    }
  },
};
