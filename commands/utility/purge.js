const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Deletes all messages in the channel."),

  async execute(interaction) {
    try {
      const channel = interaction.channel;

      // Ensure the bot has permission to manage messages in the channel
      if (!channel.permissionsFor(interaction.guild.me).has("MANAGE_MESSAGES")) {
        return await interaction.reply({
          content: "I do not have permission to manage messages in this channel.",
          ephemeral: true,
        });
      }

      // Fetch and delete messages in the channel
      await channel.messages.fetch({ limit: 100 }).then(async (messages) => {
        // Filter out messages that are older than 14 days as Discord doesn't allow deletion of messages older than that
        const messagesToDelete = messages.filter(
          (message) => message.createdTimestamp > Date.now() - 1209600000
        );

        // Delete messages
        await channel.bulkDelete(messagesToDelete, true).catch((error) => {
          console.error("Error deleting messages:", error);
          return interaction.reply({
            content: "An error occurred while trying to purge the messages.",
            ephemeral: true,
          });
        });

        // Send a completion message and delete it after 10 seconds
        const replyMessage = await interaction.reply({
          content: "Channel has been purged successfully!",
          ephemeral: true,
        });

        setTimeout(async () => {
          try {
            await replyMessage.delete();
          } catch (error) {
            console.error("Error deleting reply:", error);
          }
        }, 10000); // 10 seconds timer
      });
    } catch (error) {
      console.error("Error in purge command:", error);
      await interaction.reply({
        content: "An error occurred while executing the purge command.",
        ephemeral: true,
      });
    }
  },
};
