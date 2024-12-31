const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("syncusers")
    .setDescription("Sync users by renaming and assigning roles."),
  async execute(interaction) {
    // Example data
    const usersData = [
      { discordId: "409123936748437516", inGameUsername: "Popxorn123", alliance: "The Rumbling" },
      { discordId: "963603991063851018", inGameUsername: "DVNCE", alliance: "Yeagerists" },
      // Add more users as needed
    ];

    try {
      // Loop through each user in the data array
      for (const user of usersData) {
        const member = await interaction.guild.members.fetch(user.discordId);

        if (!member) {
          console.log(`User with ID ${user.discordId} not found.`);
          continue;
        }

        // Rename the member to "[TR05] InGameUsername"
        const newNickname = `[TR05] ${user.inGameUsername}`;
        await member.setNickname(newNickname);
        console.log(`Renamed ${member.user.tag} to ${newNickname}.`);

        // Find or create the role for the alliance
        let role = interaction.guild.roles.cache.find((r) => r.name === user.alliance);
        if (!role) {
          role = await interaction.guild.roles.create({
            name: user.alliance,
            color: "BLUE", // Customize the color if needed
            reason: `Created for user synchronization.`,
          });
          console.log(`Created role ${user.alliance}.`);
        }

        // Assign the role to the member
        await member.roles.add(role);
        console.log(`Assigned role ${role.name} to ${member.user.tag}.`);
      }

      // Respond to the interaction
      await interaction.reply("Users have been synced successfully.");
    } catch (error) {
      console.error(error);
      await interaction.reply("An error occurred while syncing users.");
    }
  },
};
