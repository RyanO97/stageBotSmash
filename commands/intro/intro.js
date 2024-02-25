const { SlashCommandBuilder, codeBlock } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('intro')
		.setDescription('bot introduces itself'),
	async execute(interaction) {
		await interaction.reply(`Hello! I am StageBot. I can simulate the stage picking process between competitors in a fighting game.\nThese are the commands you can give me!\n${codeBlock('/data')}\n${codeBlock('/sim')}\n${codeBlock('/strike')}\n${codeBlock('/pick')}\n${codeBlock('/list')}`);
	},

};