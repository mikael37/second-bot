// clearroles.js

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clearroles")
        .setDescription("Removes specified roles from all members."),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }); // Defer reply for longer operations

        const removeRoleIds = [
          "1323850193312940104",
          "1323849912508481617",
          "1323849911900442715",
          "1323849904161951794",
          "1323727567613595769",
          "1325568167480918207",
          "1325568136543473772",
          "1325568167480918207",
          "1325568167480918207",
          "1324055858786861077"
        ];

        const guild = interaction.guild;
        const members = await guild.members.fetch();

        let removedCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const roleId of removeRoleIds) {
            for (const member of members.values()) {
                try {
                    await member.roles.remove(roleId);
                    removedCount++;
                } catch (roleError) {
                    errorCount++;
                   errors.push(`Error removing role ${roleId} from ${member.user.tag}: ${roleError.message}`);
                   console.error(`Error removing role ${roleId} from ${member.user.tag}:`, roleError);
                }
            }
        }

        let replyMessage = `Successfully removed roles from ${removedCount} users.`;

        if (errorCount > 0) {
          replyMessage += `\nEncountered ${errorCount} errors during role removal.`;
          replyMessage += "\n\n **Errors:** \n"
          replyMessage += errors.join("\n");
        }

        await interaction.editReply({ content: replyMessage, ephemeral: true });

    },
};