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
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const targetData = interaction.options.getString('target_data');
    const newValue = interaction.options.getString('new_value');
    const additionalDetail = interaction.options.getString('additional_detail') || 'None';

    // Create the initial embed message
    const embed = new EmbedBuilder()
      .setColor(0xFFFF00) // Set color to neon yellow
      .setTitle(targetUser.nickname ? `${targetUser.username} (${targetUser.nickname})` : `${targetUser.username}`)
      .setDescription('A new data change request has been submitted.')
      .addFields(
        { name: 'Target User', value: `${targetUser.tag}`, inline: true },
        { name: 'Target Data', value: targetData, inline: true },
        { name: 'New Value', value: newValue, inline: true },
        { name: 'Additional Detail', value: additionalDetail, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `Requested by ${interaction.user.tag}` });

    // Buttons for confirming the data change
    const confirm = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Mark as Completed')
      .setStyle(ButtonStyle.Success);

    const cancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(confirm, cancel);

    // Send the embed and buttons to a channel
    const channel = interaction.client.channels.cache.get('1317870586760007802');
    if (channel) {
      try {
        await interaction.reply({ content: 'Processing your request...', ephemeral: true });
        const message = await channel.send({ embeds: [embed], components: [row] });
        // Store necessary information in the message for future reference
        message.targetUser = targetUser; // Attach targetUser to message
      } catch (error) {
        console.error('Error sending interaction response:', error);
      }
    } else {
      console.error('Channel not found.');
    }
  },

  async buttonInteractionHandler(interaction) {
    if (interaction.isButton()) {
      try {
        // Retrieve the targetUser stored on the message
        const targetUser = interaction.message.targetUser;

        if (interaction.customId === 'confirm') {
          const updatedEmbed = new EmbedBuilder(interaction.message.embeds[0])
            .setColor(0x00FF00) // Green color for success
			.setTitle(targetUser.nickname ? `${targetUser.username} (${targetUser.nickname})` : `${targetUser.username}`)
            .setDescription('The data change request has been successfully processed. \n');

          await interaction.update({
            embeds: [updatedEmbed],
            components: [],
          });
        } else if (interaction.customId === 'cancel') {
          const canceledEmbed = new EmbedBuilder()
            .setColor(0xFF0000) // Red color (can be changed to another color)
            .setTitle(`Request Canceled by ${interaction.user.username}`)
            .setDescription('The data change request has been canceled.')
            .setTimestamp()
            .setFooter({ text: `Deleted by ${interaction.user.tag}` }); // Footer with the user who pressed cancel

          await interaction.update({
            embeds: [canceledEmbed],
            components: [], // Remove buttons
          });
        }
      } catch (error) {
        console.error('Error handling button interaction:', error);
      }
    }
  },
};
