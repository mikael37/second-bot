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

        // Send initial message to indicate the operation has started
        let progressMessage = await interaction.editReply({
            content: "Starting to remove roles from members... Please wait.",
            ephemeral: true
        });

        for (const roleId of removeRoleIds) {
            console.log(`Starting to remove role: ${roleId}`);

            // Loop through all members and remove the role if they have it
            for (const member of members.values()) {
                try {
                    // Check if the member has the role before attempting to remove it
                    if (member.roles.cache.has(roleId)) {
                        await member.roles.remove(roleId);
                        removedCount++;
                    }
                } catch (roleError) {
                    errorCount++;
                    errors.push(`Error removing role ${roleId} from ${member.user.tag}: ${roleError.message}`);
                    console.error(`Error removing role ${roleId} from ${member.user.tag}:`, roleError);
                }
            }

            // Send progress update every 50 removed roles (or when a roleId is fully processed)
            if (removedCount % 50 === 0 || removedCount === members.size) {
                console.log(`Removed roles from ${removedCount} users so far...`);
                try {
                    // Send a new progress message
                    progressMessage = await interaction.followUp({
                        content: `Removed roles from ${removedCount} users so far...`,
                        ephemeral: true
                    });
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
