const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

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

      // Send a message asking for confirmation
      const confirmButton = new ButtonBuilder()
        .setCustomId("confirmSync")
        .setLabel("Confirm Sync")
        .setStyle(ButtonStyle.Primary);

      const cancelButton = new ButtonBuilder()
        .setCustomId("cancelSync")
        .setLabel("Cancel Sync")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

      await interaction.editReply({
        content: "Do you want to proceed with syncing the database?",
        components: [row],
      });

      // Wait for button interaction
      const filter = (i) => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 15000, // Wait for 15 seconds for a response
      });

      collector.on("collect", async (i) => {
        if (i.customId === "confirmSync") {
          // Proceed with the sync if confirmed
          await i.update({ content: "Syncing database...", components: [] });
          await performSync(interaction, usersData); // Perform the sync task
        } else if (i.customId === "cancelSync") {
          // Abort if canceled
          await i.update({ content: "Sync operation canceled.", components: [] });
        }

        collector.stop(); // Stop collecting after the user responds
      });

      collector.on("end", (collected, reason) => {
        if (reason === "time") {
          interaction.editReply({
            content: "You took too long to respond. Sync operation canceled.",
            components: [],
          });
        }
      });
    } catch (error) {
      console.error("Bulk assignment failed:", error);
      await interaction.editReply('An error occurred while assigning roles in bulk.');
    }
  },
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
    "Yeagerists": "1323849904161951794",
    "Shiganshina's Hope": "1323850193312940104",
    "The Survey Corps": "1323849911900442715",
    "Devils of Paradis": "1323849912508481617",
  };

  const kingdomRoleId = "1324055858786861077";

  const statusMessages = [];

  for (const user of usersData) {
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
}
