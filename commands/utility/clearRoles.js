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

        // Initial progress message
        let progressMessage;
        try {
            progressMessage = await interaction.editReply({
                content: "Starting to remove roles from members... Please wait.",
                ephemeral: true
            });
        } catch (err) {
            console.error("Error sending progress message:", err);
            await interaction.editReply({
                content: "Error while trying to start the role removal process.",
                ephemeral: true
            });
            return;
        }

        // Processing the removal in chunks to avoid blocking
        for (const roleId of removeRoleIds) {
            console.log(`Starting to remove role: ${roleId}`);

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

            // Periodically update progress to avoid timing out
            if (removedCount % 50 === 0 || removedCount === members.size) {
                console.log(`Removed roles from ${removedCount} users so far...`);
                try {
                    // Check if progressMessage is valid before editing
                    if (progressMessage) {
                        await progressMessage.edit({
                            content: `Removed roles from ${removedCount} users so far...`
                        });
                    }
                } catch (err) {
                    console.error("Error updating progress message:", err);
                }
            }
        }

        let replyMessage = `Successfully removed roles from ${removedCount} users.`;

        if (errorCount > 0) {
            replyMessage += `\nEncountered ${errorCount} errors during role removal.`;
            replyMessage += "\n\n **Errors:** \n";
            replyMessage += errors.join("\n");
        }

        // Final reply or edit
        try {
            await interaction.editReply({
                content: replyMessage,
                ephemeral: true
            });
        } catch (err) {
            console.error("Error sending final reply:", err);
        }
    },
};
