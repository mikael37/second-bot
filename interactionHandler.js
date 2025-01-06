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

  async function sendChunks(interaction, messages) {
    const chunkSize = 2000;
    let messageChunk = '';

    for (let i = 0; i < messages.length; i++) {
      if (messageChunk.length + messages[i].length > chunkSize) {
        // Send the current chunk
        await interaction.followUp({ content: messageChunk, ephemeral: true });
        // Reset the chunk
        messageChunk = '';
      }

      messageChunk += messages[i] + '\n';

      // If it's the last message, send it even if it exceeds the chunk limit
      if (i === messages.length - 1) {
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
        statusMessages.push(`The user with ID <@${user.discordId}> could not be located within the guild's members or is excluded.`);
        continue;
      }

      try {
        const prefix = alliancePrefixes[user.alliance] || "";
        const newNickname = `[${prefix}] ${user.inGameUsername}`;
        await member.setNickname(newNickname);

        // Special case for users in "Migrant", "Academy / Farm", or "Shadow Death" alliances
        const specialAlliances = ["Migrant", "Academy / Farm", "Shadow Death", "None"];
        if (specialAlliances.includes(user.alliance)) {
          // Assign only the Kingdom role
          if (!member.roles.cache.has(kingdomRoleId)) {
            await member.roles.add(kingdomRoleId);
            statusMessages.push(`User: <@${member.user.id}> has been assigned the Kingdom role only.`);
          }
        } else {
          const roleId = allianceRoleIds[user.alliance];
          if (roleId) {
            await member.roles.add(roleId);
            
            // Only add kingdom role if the user does not have the "Migrant" or "Unaffiliated" role
            const hasMigrantRole = member.roles.cache.has(allianceRoleIds["Migrant"]);

            if (!hasMigrantRole) {
              await member.roles.add(kingdomRoleId);
            }

            statusMessages.push(`User: <@${member.user.id}> has been successfully renamed and assigned <@&${roleId}>`);
          } else {
            statusMessages.push(`The alliance role '${user.alliance}' was not found in the database. The role assignment for this user has been skipped.`);
          }
        }
      } catch (userError) {
        console.error(`Error updating ${user.discordId}:`, userError);
        statusMessages.push(`An error occurred while updating the user with ID <@${user.discordId}>.`);
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
