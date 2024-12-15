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
	  
		if (subcommand === 'data-change') {
		  const targetUser = interaction.options.getUser('target');
		  const targetData = interaction.options.getString('target_data');
		  const newValue = interaction.options.getString('new_value');
		  const additionalDetail = interaction.options.getString('additional_detail') || 'None';
	  
		  // Fetch the target user as a guild member to get their server nickname
		  const targetMember = await interaction.guild.members.fetch(targetUser.id);
		  
		  // Use targetMember.nickname if it exists, otherwise fallback to username
		  const nickname = targetMember.nickname || targetUser.username;
	  
		  // Create the initial embed message for data-change request
		  const embed = new EmbedBuilder()
			.setColor(0xFFFF00) // Set color to neon yellow
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
			  await channel.send({ embeds: [embed], components: [row] });
			} catch (error) {
			  console.error('Error sending interaction response:', error);
			}
		  } else {
			console.error('Channel not found.');
		  }
		} else if (subcommand === 'remove') {
		  const targetUser = interaction.options.getUser('target');
	  
		  // Fetch the target user as a guild member to get their server nickname
		  const targetMember = await interaction.guild.members.fetch(targetUser.id);
	  
		  // Use targetMember.nickname if it exists, otherwise fallback to username
		  const nickname = targetMember.nickname || targetUser.username;
	  
		  // Simulate database removal logic (replace with actual logic)
		  // For example: deleteUserData(targetUser.id); (Placeholder for actual database removal)
	  
		  // Create an embed for removal confirmation
		  const embed = new EmbedBuilder()
			.setColor(0x0D47A1)
			.setTitle(`Data Removal: ${targetUser.username} (${nickname})`)
			.setDescription(`A new data removal request has been submitted.`)
			.setTimestamp()
			.setFooter({ text: `Requested by ${interaction.user.tag}` });
	  
		  // Send the removal confirmation embed to a channel
		  const channel = interaction.client.channels.cache.get('1317870586760007802');
		  if (channel) {
			try {
			  await interaction.reply({ content: 'Processing the removal request...', ephemeral: true });
			  await channel.send({ embeds: [embed] });
			} catch (error) {
			  console.error('Error sending interaction response:', error);
			}
		  } else {
			console.error('Channel not found.');
		  }
		}
	  },	  
};
