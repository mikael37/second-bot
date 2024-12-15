const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('request_data_change')
    .setDescription('Submit a request to change data')
	.addStringOption(option =>
		option.setName('Target User')
			.setDescription('The individual to be affected by the request.')
			.setRequired(true))

		.addStringOption(option =>
			option.setName('Target Data(s)')
			.setDescription('The revised value for the data.')
			.setRequired(true))

		.addStringOption(option =>
		option.setName('Additional Detail(s)')
			.setDescription('Any extra context/information that may be necessary.')
			.setRequired(false)),
	

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
