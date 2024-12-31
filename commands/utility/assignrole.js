const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("assignrole")
    .setDescription("Assigns a role to a user with a specific ID."),
  async execute(interaction) {
    const targetUserID = "409123936748437516"; // The target user ID
    const roleID = "1323727567613595769"; // The role ID to assign

    try {
      // Get all members in the server
      const members = await interaction.guild.members.fetch();

      // Find the member with the specified user ID
      const member = members.get(targetUserID);

      if (!member) {
        return interaction.reply("User with the specified ID not found.");
      }

      // Assign the role to the found member
      await member.roles.add(roleID);

      // Reply with a success message
      return interaction.reply(`Role successfully assigned to ${member.user.tag}.`);
    } catch (error) {
      console.error(error);
      return interaction.reply("An error occurred while assigning the role.");
    }
  },
};
