const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

let dataChangeRequestCount = 0; // Variable to keep track of the number of requests. You can persist this in a database.

module.exports = {
  data: new SlashCommandBuilder()
    .setName("request")
    .setDescription("Submit a request")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("data-change")
        .setDescription("Request a data-change order")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("The individual to be affected.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("target_data")
            .setDescription("The value to modify.")
            .setRequired(true)
            .addChoices(
              { name: "Discord Username", value: "discord_username" },
              { name: "In-game Name", value: "ingame_name" },
              { name: "Alliance", value: "alliance" },
              { name: "Active Time", value: "active_time" },
              { name: "Troop Focus", value: "troop_focus" },
              { name: "Booster Account", value: "booster_account" },
              { name: "Farm Account", value: "farm_account" },
              { name: "Timezone", value: "timezone" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("new_value")
            .setDescription("The revised value.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("additional_detail")
            .setDescription("Additional context.")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Request to remove a user's data")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("The individual whose data to delete.")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    await interaction.deferReply({ ephemeral: true });

    const channelId = process.env.REQUEST_CHANNEL_ID || "1317870586760007802";
    const channel = interaction.client.channels.cache.get(channelId);

    if (!channel) {
      await interaction.editReply({
        content: "Error: Channel not found.",
        ephemeral: true,
      });
      return;
    }

    if (subcommand === "remove") {
      const targetUser = interaction.options.getUser("target");

      // Build the embed with data
      const embed = new EmbedBuilder()
        .setColor(0xffff00)
        .setTitle(`Data Removal Request #${dataChangeRequestCount}`)
        .setDescription("A data removal request has been made.")
        .addFields(
          { name: "Target User", value: targetUser.tag, inline: true }
        )
        .setFooter({ text: `Target User ID: ${targetUser.id}` })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm_remove_data")
          .setLabel("Confirm")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("cancel_remove_data")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({ embeds: [embed], components: [row] });

      await interaction.editReply({
        content: "Request submitted successfully.",
        ephemeral: true,
      });
    } else if (subcommand === "data-change") {
      const targetUser = interaction.options.getUser("target");
      const targetData = interaction.options.getString("target_data");
      const newValue = interaction.options.getString("new_value");
      const additionalDetail = interaction.options.getString("additional_detail");

      // Increment the request count
      dataChangeRequestCount++;

      // Build the embed with data
      const embed = new EmbedBuilder()
        .setColor(0xffff00)
        .setTitle(`Data Change Request #${dataChangeRequestCount}`)
        .setDescription("A data change request has been made.")
        .addFields(
          { name: "Target User", value: targetUser.tag, inline: true },
          { name: "Target Data", value: targetData, inline: true },
          { name: "New Value", value: newValue, inline: true }
        )
        .setFooter({ text: `Target User ID: ${targetUser.id}` })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm_change_data")
          .setLabel("Mark as Completed")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("cancel_change_data")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({ embeds: [embed], components: [row] });

      await interaction.editReply({
        content: "Data change request submitted successfully.",
        ephemeral: true,
      });
    }
  },
};
