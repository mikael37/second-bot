const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('Request-Data-Change')
    .setDescription('Submit a request to change data'),
  async execute(interaction) {
    // Reply to the user
    await interaction.reply('Request submitted successfully!');
    
    // Create the embed message
    const embed = new EmbedBuilder()
      .setColor(0x0099FF) // Blue color
      .setTitle('Data Change Request')
      .setDescription('A new data change request has been submitted.')
      .addFields(
        { name: 'Requested by', value: interaction.user.tag },
        { name: 'Request Details', value: 'Details of the request go here.' },
      )
      .setTimestamp();
	  
    const channel = interaction.client.channels.cache.get('1317870586760007802');
    
    if (channel) {
      // Send the embed to the channel
      await channel.send({ embeds: [embed] });
    } else {
      console.error('Channel not found.');
    }
  },
};
