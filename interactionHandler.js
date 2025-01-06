const fs = require("fs");

module.exports = async (interaction) => {
  if (!interaction.isButton()) {
    return;
  }

  const { customId } = interaction;

  try {
    if (customId === "confirmSync") {
      await interaction.update({
        content: "The database synchronization process is currently in progress. Please be patient as updates are applied.",
        components: [],
        ephemeral: true,
      });

      const usersData = JSON.parse(fs.readFileSync("userData.json"));
      console.log("Starting the synchronization process...");
      await performSync(interaction, usersData);
    } else if (customId === "cancelSync") {
      await interaction.update({
        content: `The synchronization operation has been canceled at the request of <@${interaction.user.id}>. No further changes have been made.`,
        components: [],
        ephemeral: true,
      });

      console.log(`Sync operation canceled by ${interaction.user.tag}.`);
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

async function performSync(interaction, usersData) {
  const guild = interaction.guild;
  const members = await guild.members.fetch();

  const alliancePrefixes = {
    "Shadow Spartans": "SS",
    "Shadow Lumina": "SL",
    "Shadow Eclipse": "SE",
    "Shadow Monarchs": "SC",
    "Shadow Vanguard": "SV",
    "Unaffiliated": "",
    "Migrant": "MGR",
    "Academy / Farm": "",
    "Shadow Death": "SD",
    "None": ""
  };

  const allianceRoleIds = {
    "Shadow Spartans": "1297514305972998204",
    "Shadow Lumina": "1301315222073507860",
    "Shadow Eclipse": "1306716369533800479",
    "Shadow Monarchs": "1297514413263159346",
    "Shadow Vanguard": "1297514368287768606",
    "Unaffiliated": "1325568167480918207",
    "Migrant": "1325565433348227212",
    "Academy / Farm": "",
    "Shadow Death": "",
    "None": "1325567866073911400"
  };

  const kingdomRoleId = "1310229163847974982"; // Kingdom role ID
  const syncExclusionRoleId = "1325565234894733414"; // Sync-Exclusion role ID
  const statusMessages = [];

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function safeCall(promiseFn, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        return await promiseFn();
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        console.error("Retrying due to error:", error);
        await delay(1000);
      }
    }
  }

  await interaction.editReply({
    content: "Proceeding to rename users and assign new roles.",
    ephemeral: true,
  });

  console.log("Assigning roles and renaming users...");
  const batchSize = 10; // Process 10 users at a time

  for (let i = 0; i < usersData.length; i += batchSize) {
    const batch = usersData.slice(i, i + batchSize);

    for (const user of batch) {
      const member = members.get(user.discordId);
      if (!member) {
        statusMessages.push(`The user with ID <@${user.discordId}> could not be located within the guild's members.`);
        continue;
      }

      if (member.roles.cache.has(syncExclusionRoleId)) {
        statusMessages.push(`User <@${member.user.id}> has the Sync-Exclusion role and is excluded from the sync process.`);
        continue;
      }

      try {
        const prefix = alliancePrefixes[user.alliance] || "";
        const newNickname = `[${prefix}] ${user.inGameUsername}`;

        await safeCall(() => member.setNickname(newNickname));

        const specialAlliances = ["Migrant", "Academy / Farm", "Shadow Death", "None"];
        if (specialAlliances.includes(user.alliance)) {
          if (!member.roles.cache.has(kingdomRoleId)) {
            await safeCall(() => member.roles.add(kingdomRoleId));
            statusMessages.push(`User: <@${member.user.id}> has been assigned the Kingdom role only.`);
          }
        } else {
          const roleId = allianceRoleIds[user.alliance];
          if (roleId) {
            await safeCall(() => member.roles.add(roleId));

            const hasMigrantRole = member.roles.cache.has(allianceRoleIds["Migrant"]);
            if (!hasMigrantRole) {
              await safeCall(() => member.roles.add(kingdomRoleId));
            }

            statusMessages.push(`User: <@${member.user.id}> has been successfully renamed and assigned <@&${roleId}>.`);
          } else {
            statusMessages.push(`The alliance role '${user.alliance}' was not found in the database. Role assignment skipped.`);
          }
        }
      } catch (userError) {
        console.error(`Error updating ${user.discordId}:`, userError);
        statusMessages.push(`An error occurred while updating the user with ID <@${user.discordId}>.`);
      }
    }

    await interaction.editReply({
      content: `Processed ${i + batch.length} of ${usersData.length} users so far...`,
      ephemeral: true,
    });

    await delay(1000); // Delay between batches to avoid hitting rate limits
  }

  console.log("Sync complete, sending final message...");
  await interaction.editReply({
    content: statusMessages.join("\n"),
    ephemeral: true,
  });
}
