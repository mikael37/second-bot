const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, Intents } = require('discord.js');
const clearRoles = require('./commands/clearroles'); // Import the clearroles.js file

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearroles')
        .setDescription('Clears roles from specified members'),

    async execute(interaction) {
        // Call the clear roles function
        await interaction.reply('Starting to remove roles...');
        try {
            await clearRoles(); // This assumes clearroles.js is a function
            await interaction.followUp('Roles removed successfully!');
        } catch (error) {
            console.error(error);
            await interaction.followUp('An error occurred while removing roles.');
        }
    },
};
