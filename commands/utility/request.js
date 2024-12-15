const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('request')
    .setDescription('Submit a request')
    .addSubcommand(subcommand =>
      subcommand
        .setName('data-change')
        .setDescription('Request a data-change order')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('The individual to be affected by the request.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('target_data')
            .setDescription('The value to modify.')
            .setRequired(true)
            .addChoices(
              { name: 'Discord Username', value: 'discord_username' },
              { name: 'In-game Name', value: 'ingame_name' },
              { name: 'Alliance', value: 'alliance' },
              { name: 'Active Time', value: 'active_time' },
              { name: 'Troop Focus', value: 'troop_focus' },
              { name: 'Booster Account', value: 'booster_account' },
              { name: 'Farm Account', value: 'farm_account' },
              { name: 'Timezone', value: 'timezone' }
            )
        )
        .addStringOption(option =>
          option
            .setName('new_value')
            .setDescription('The revised value for the data.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('additional_detail')
            .setDescription('Any additional context or information that may be necessary.')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Request to remove a user\'s data from the database')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('The individual whose data needs to be deleted.')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    // Defer the reply to avoid interaction timeout
    await interaction.deferReply({ ephemeral: true });

    if (subcommand === 'data-change') {
      const targetUser = interaction.options.getUser('target');
      const targetData = interaction.options.getString('target_data');
      const newValue = interaction.options.getString('new_value');
      const additionalDetail = interaction.options.getString('additional_detail') || 'None';

      const targetMember = await interaction.guild.members.fetch(targetUser.id);
      const nickname = targetMember.nickname || targetUser.username;

      const embed = new EmbedBuilder()
        .setColor(0xFFFF00) // Neon yellow color
        .setTitle(`${targetUser.username} (${nickname})`)
        .setDescription('A new data change request has been submitted.')
        .addFields(
          { name: 'Target User', value: `${targetUser.tag}`, inline: true },
          { name: 'Target Data', value: targetData, inline: true },
          { name: 'New Value', value: newValue, inline: true },
          { name: 'Additional Detail', value: additionalDetail, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });

      const confirm = new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Mark as Completed')
        .setStyle(ButtonStyle.Success);

      const cancel = new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(confirm, cancel);

      const channel = interaction.client.channels.cache.get('1317870586760007802');
      if (channel) {
        await channel.send({ embeds: [embed], components: [row] });
        await interaction.editReply({ content: 'Request submitted successfully!', ephemeral: true });
      } else {
        console.error('Channel not found.');
      }
    } else if (subcommand === 'remove') {
      const targetUser = interaction.options.getUser('target');
      const targetMember = await interaction.guild.members.fetch(targetUser.id);
      const nickname = targetMember.nickname || targetUser.username;

      const embed = new EmbedBuilder()
        .setColor(0x0D47A1)
        .setTitle(`Data Removal: ${targetUser.username} (${nickname})`)
        .setDescription(`A new data removal request has been submitted.`)
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });

      const confirm = new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Mark as Completed')
        .setStyle(ButtonStyle.Success);

      const cancel = new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(confirm, cancel);

      const channel = interaction.client.channels.cache.get('1317870586760007802');
      if (channel) {
        await channel.send({ embeds: [embed], components: [row] });
        await interaction.editReply({ content: 'Removal request submitted successfully!', ephemeral: true });
      } else {
        console.error('Channel not found.');
      }
    }
  },

  async buttonInteractionHandler(interaction) {
    if (interaction.isButton()) {
      try {
        const targetUser = interaction.message.embeds[0].fields[0].value.split('#')[0]; // Get the username from the message
        const user = await interaction.guild.members.fetch(targetUser);

        if (interaction.customId === 'confirm') {
          const updatedEmbed = new EmbedBuilder(interaction.message.embeds[0])
            .setColor(0x00FF00) // Green for success
            .setDescription('The request has been processed successfully.');

          await interaction.update({
            embeds: [updatedEmbed],
            components: [],
          });
        } else if (interaction.customId === 'cancel') {
          const canceledEmbed = new EmbedBuilder()
            .setColor(0xFF0000) // Red for cancel
            .setTitle(`Request Canceled by ${interaction.user.username}`)
            .setDescription('The request has been canceled.')
            .setTimestamp()
            .setFooter({ text: `Canceled by ${interaction.user.tag}` });

          await interaction.update({
            embeds: [canceledEmbed],
            components: [],
          });
        }
      } catch (error) {
        console.error('Error handling button interaction:', error);
      }
    }
  },
};
