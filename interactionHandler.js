const fs = require("fs");
const clearRoles = require('./commands/utility/clearRoles');

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
    } else if (customId === "clearRoles") {
      // Handle the clearRoles button interaction
      await interaction.update({
        content: "The process of clearing roles is starting. Please wait...",
        components: [],
        ephemeral: true,
      });

      console.log("Starting the role removal process...");
      await clearRoles(); // Trigger the clearRoles function
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
    "Migrant": "MIGRANT",
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
    "Unaffiliated": "",
    "Migrant": "1325565433348227212",
    "Academy / Farm": "",
    "Shadow Death": "",
    "None": ""
  };

  const kingdomRoleId = "1310229163847974982"; // Kingdom role ID
  const syncExclusionRoleId = "1325565234894733414"; // Sync-Exclusion role ID
  const statusMessages = [];
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function sendChunks(interaction, messages) {
    const chunkSize = 2000;
    let messageChunk = '';

    for (let i = 0; i < messages.length; i++) {
      // Format the message properly with userId, message, and roleId
      const formattedMessage = `* <@${messages[i].userId}>: \`${messages[i].message}\` <@&${messages[i].roleId}>`;

      if (messageChunk.length + formattedMessage.length > chunkSize) {
        // Send the current chunk
        await interaction.followUp({ content: messageChunk, ephemeral: true });
        // Reset the chunk
        messageChunk = '';
      }

      messageChunk += `${formattedMessage}\n`;

      // If it's the last message, send it even if it exceeds the chunk limit
      if (i === messages.length - 1 && messageChunk.trim() !== '') {
        await interaction.followUp({ content: messageChunk, ephemeral: true });
      }
    }
  }

  async function safeCall(promiseFn, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        return await promiseFn();
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        console.error("Retrying due to error:", error);
        await delay(100);
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
      if (!member || member.user.bot || member.id === guild.ownerId || member.roles.cache.has(syncExclusionRoleId)) {
        statusMessages.push({
          userId: user.discordId,
          message: "Could not be located or excluded",
          roleId: "", // No role assigned
        });
        continue;
      }

      try {
        const prefix = alliancePrefixes[user.alliance] || "";
        const newNickname = `[${prefix}] ${user.inGameUsername}`;
        await member.setNickname(newNickname);

        const specialAlliances = ["Academy / Farm", "Shadow Death", "Unaffiliated", "Migrant", "None"];
        if (specialAlliances.includes(user.alliance)) {
          // Assign only the Kingdom role
          if (!member.roles.cache.has(kingdomRoleId)) {
            await member.roles.add(kingdomRoleId);
            statusMessages.push({
              userId: member.user.id,
              message: "Renamed and assigned",
              roleId: kingdomRoleId,
            });
          }
        } else {
          const roleId = allianceRoleIds[user.alliance];
          if (roleId) {
            await member.roles.add(roleId);

            // Only add kingdom role if the user does not have the "Migrant" or "Unaffiliated" role
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
        statusMessages.push({
          userId: user.discordId,
          message: "Error occurred during update",
          roleId: "",
        });
      }
    }

    await interaction.editReply({
      content: `Processed ${i + batchSize} of ${usersData.length} users so far...`,
      ephemeral: true,
    });

    await delay(100); // Delay between batches to avoid hitting rate limits
  }

  console.log("Sync complete, sending final message...");
  // Break status messages into smaller chunks to avoid exceeding Discord's limit
  await sendChunks(interaction, statusMessages);
}
