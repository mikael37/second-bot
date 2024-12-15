const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('request_data_change')
    .setDescription('Submit a request to change data')
    .addStringOption(option =>
      option.setName('target_user')
        .setDescription('The Individual to Be Affected by the Request.')
        .setRequired(true))

    .addStringOption(option =>
      option.setName('target_data')
        .setDescription('The Revised Value for the Data.')
        .setRequired(true))
		
    .addStringOption(option =>
      option.setName('additional_detail')
        .setDescription('Any Additional Context or Information That May Be Necessary.')
        .setRequired(false)),

  async execute(interaction) {
    // Reply to the user
    await interaction.reply({ content: 'Request submitted.', ephemeral: true });
    
    // Create the embed message
    const embed = new EmbedBuilder()
      .setColor(0x0099FF) // Blue color
      .setTitle('Modification Request')
      .setDescription('A new data change request has been submitted.')
      .addFields(
        { name: 'Target User', value: interaction.options.getString('target_user') },
        { name: 'Target Data', value: interaction.options.getString('target_data') },
        { name: 'Additional Details', value: interaction.options.getString('additional_detail') || 'None provided.' },
      )
      .setTimestamp()
      .setFooter({ text: `Requested by ${interaction.user.tag}` });

    const channel = interaction.client.channels.cache.get('1317870586760007802');
    
    if (channel) {
      // Send the embed to the channel
      await channel.send({ embeds: [embed] });
    } else {
      console.error('Channel not found.');
    }
  },
};
