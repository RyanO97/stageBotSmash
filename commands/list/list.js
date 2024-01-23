const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');

const p = JSON.parse(require('fs').readFileSync('./data/stage_pools.json'));
module.exports = {
	data: new SlashCommandBuilder().setName('list').setDescription('View stage lists'),
	async execute(interaction) {
		const select = new StringSelectMenuBuilder()
			.setCustomId('starter')
			.setPlaceholder('Make a selection!')
			.addOptions(p.stagePools.map((list) => new StringSelectMenuOptionBuilder().setLabel(list.stagePoolName).setDescription('Tournament Stage List').setValue(list.stagePoolName)));

		const row = new ActionRowBuilder()
			.addComponents(select);

		await interaction.reply({
			content: 'Choose your Stage List!',
			components: [row],
		});
	},
};