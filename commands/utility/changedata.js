const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('request_data_change')
    .setDescription('Submit a request to change data')
	.addStringOption(option =>
		option.setName('input')
			.setDescription('The input to echo back'))
	.addBooleanOption(option =>
		option.setName('ephemeral')
			.setDescription('Whether or not the echo should be ephemeral')),
	

  async execute(interaction) {
    // Reply to the user
    await interaction.reply({ content: "Request submitted.", flags: MessageFlags.Ephemeral });
    
    // Create the embed message
    const embed = new EmbedBuilder()
      .setColor(0x0099FF) // Blue color
      .setTitle('Modification Request')
      .setDescription('A new data change request has been submitted.')
      .addFields(
        { name: 'Request Details', value: '-' },
      )
      .setTimestamp()
      .setFooter({ text: `Requested by <${interaction.user.username}>` });

    const channel = interaction.client.channels.cache.get('1317870586760007802');
    
    if (channel) {
      // Send the embed to the channel
      await channel.send({ embeds: [embed] });
    } else {
      console.error('Channel not found.');
    }
  },
};
