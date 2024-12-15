const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
              { name: 'In-game Name', value: 'ingame_name' }
            )
        )
        .addStringOption(option =>
          option
            .setName('new_value')
            .setDescription('The revised value for the data.')
            .setRequired(true)
            .addChoices(
              { name: 'Discord Username', value: 'gif_funny' },
              { name: 'In-game Name', value: 'ingame_name' }
            )
        )
        .addStringOption(option =>
          option
            .setName('additional_detail')
            .setDescription('Any additional context or information that may be necessary.')
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    // Retrieve options
    const targetUser = interaction.options.getUser('target');
    const targetData = interaction.options.getString('target_data');
    const newValue = interaction.options.getString('new_value');
    const additionalDetail = interaction.options.getString('additional_detail') || 'None';

    // Ensure all required data is present
    if (!targetUser || !targetData) {
      return interaction.reply({ content: 'Missing required fields.', ephemeral: true });
    }

    // Create the embed message
    const embed = new EmbedBuilder()
      .setColor(0x0099FF) // Blue color
      .setTitle('Modification Request')
      .setDescription('A new data change request has been submitted.')
      .addFields(
        { name: 'Target User', value: `${targetUser.tag}`, inline: true },
        { name: 'Target Data', value: targetData, inline: true },
        { name: 'New Value', value: newValue, inline: true },
        { name: 'Additional Detail', value: additionalDetail, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `Requested by ${interaction.user.tag}` });

    const channel = interaction.client.channels.cache.get('1317870586760007802');
    
    if (channel) {
      // Send the embed to the channel
      await channel.send({ embeds: [embed] });
      // Acknowledge the command with an ephemeral reply
      await interaction.reply({ content: 'Request submitted.', ephemeral: true });
    } else {
      console.error('Channel not found.');
    }
  },
};
