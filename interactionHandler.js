const fs = require("fs");
const clearRoles = require('./commands/utility/clearRoles');

module.exports = async (interaction) => {
  if (!interaction.isButton()) {
    return;
  }

  const { customId } = interaction;

  try {
    if (customId === "confirmSync") {
      const initialMessage = await interaction.update({
        content: "The database synchronization process is about to start. Please confirm or cancel.",
        components: [],
        ephemeral: true,
      });

      await initialMessage.edit({
        content: "The database synchronization process is currently in progress. Please be patient as updates are applied.",
        components: [],
        ephemeral: true,
      });

      const usersData = JSON.parse(fs.readFileSync("userData.json"));
      console.log("Starting the synchronization process...");
      await performSync(interaction, usersData, initialMessage);
    } else if (customId === "cancelSync") {
      await interaction.update({
        content: `The synchronization operation has been canceled at the request of <@${interaction.user.id}>. No further changes have been made.`,
        components: [],
        ephemeral: true,
      });

      console.log(`Sync operation canceled by ${interaction.user.tag}.`);
    } else if (customId === "clearRoles") {
      await interaction.update({
        content: "The process of clearing roles is starting. Please wait...",
        components: [],
        ephemeral: true,
      });

      console.log("Starting the role removal process...");
      await clearRoles();
      await interaction.followUp({
        content: "Roles have been successfully cleared from the specified users.",
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error("Error processing interaction:", error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "An error occurred while processing the interaction.",
        ephemeral: true,
      });
    }
  }
};

async function performSync(interaction, usersData, initialMessage) {
  const guild = interaction.guild;
  const members = await guild.members.fetch();

  const alliancePrefixes = {
    "Shadow Spartans": "SS",
    "Shadow Lumina": "SL",
    "Shadow Eclipse": "SE",
    "Shadow Monarchs": "SC",
    "Shadow Vanguard": "SV",
    "No Association": "",
    "Registered Migrant": "MIGRANT",
    "Academy / Farm": "",
    "Shadow Death": "SD",
    "No Association": ""
  };

  const allianceRoleIds = {
    "Shadow Spartans": "1297514305972998204",
    "Shadow Lumina": "1301315222073507860",
    "Shadow Eclipse": "1306716369533800479",
    "Shadow Monarchs": "1297514413263159346",
    "Shadow Vanguard": "1297514368287768606",
    "Unrecognized Alliance": "",
    "Registered Migrant": "1325565433348227212",
    "Academy / Farm": "",
    "Shadow Death": "",
    "No Association": ""
  };

  const kingdomRoleId = "1310229163847974982"; // Kingdom role ID
  const syncExclusionRoleId = "1325565234894733414"; // Sync-Exclusion role ID
  const statusMessages = [];
  const excludedUsers = [];
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  console.log("Assigning roles and renaming users...");
  const batchSize = 3; // Process 3 users at a time

  for (let i = 0; i < usersData.length; i += batchSize) {
    const batch = usersData.slice(i, i + batchSize);

    for (const user of batch) {
      const member = members.get(user.discordId);
      if (!member || member.user.bot || member.id === guild.ownerId || member.roles.cache.has(syncExclusionRoleId)) {
        excludedUsers.push(user.discordId);
        continue;
      }

      try {
        const prefix = alliancePrefixes[user.alliance] || "";
        const newNickname = `[${prefix}] ${user.inGameUsername}`;
        await member.setNickname(newNickname);

        if (["None", "Academy / Farm", "Migrant"].includes(user.alliance)) {
          // Assign only the Kingdom role
          if (!member.roles.cache.has(kingdomRoleId)) {
            await member.roles.add(kingdomRoleId);
            statusMessages.push({
              userId: member.user.id,
              message: `Renamed and assigned Kingdom role only (${user.alliance})`,
              roleId: kingdomRoleId,
            });
          }
        } else {
          const roleId = allianceRoleIds[user.alliance];
          if (roleId) {
            await member.roles.add(roleId);

            if (!member.roles.cache.has(allianceRoleIds["Migrant"]) && !member.roles.cache.has(allianceRoleIds["Unaffiliated"])) {
              await member.roles.add(kingdomRoleId);
            }

            statusMessages.push({
              userId: member.user.id,
              message: "Renamed and assigned",
              roleId: roleId,
            });
          } else {
            statusMessages.push({
              userId: member.user.id,
              message: "Alliance role not found in database, assignment skipped",
              roleId: "",
            });
          }
        }
      } catch (userError) {
        console.error(`Error updating ${user.discordId}:`, userError);
        excludedUsers.push(user.discordId);
      }
    }

    await delay(100);
  }

  console.log("Sync complete, sending final message...");
  for (const msg of statusMessages) {
    console.log(`Processed: ${msg.userId}, ${msg.message}`);
  }
}


