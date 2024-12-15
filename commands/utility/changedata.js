const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('request')
    .setDescription('-')
	.addSubcommand(subcommand =>
		subcommand
		.setName('data-change')
		.setDescription('Request a data-change order')

		.addUserOption(option => option
			.setName('target')
			.setDescription('The individual to be affected by the request.'))
			.setRequired(true)

		.addStringOption(option =>option
			.setName('target_data')
			.setDescription('The Revised Value for the Data.')
			.setRequired(true))
		
		.addStringOption(option =>option
				.setName('additional_detail')
				.setDescription('Any Additional Context or Information That May Be Necessary.')
				.setRequired(false)),
	),
	
  async execute(interaction) {
    // Reply to the user
    try{
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
      .setFooter({ text: `Requested by ${interaction.user.username}` });

    const channel = interaction.client.channels.cache.get('1317870586760007802');
    
    if (channel) {
      // Send the embed to the channel
      await channel.send({ embeds: [embed] });
    } else {
      console.error('Channel not found.');
    }
	} catch (error) {
		console.error('Error executing the command:', error);
	}
  },
};
