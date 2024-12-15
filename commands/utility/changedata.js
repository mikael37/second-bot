const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

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
			  .setRequired(true) // Ensure this is required
		  )
		  .addStringOption(option =>
			option
			  .setName('target_data')
			  .setDescription('The revised value for the data.')
			  .setRequired(true) // Ensure this is required
		  )
		  .addStringOption(option =>
			option
			  .setName('additional_detail')
			  .setDescription('Any additional context or information that may be necessary.')
			  .setRequired(false) // This can be optional
		  )
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
