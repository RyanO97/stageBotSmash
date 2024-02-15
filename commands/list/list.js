const { bold, italic, ComponentType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');

const p = require('../../data/stage_pools.json');
const s = require('../../data/stages.json');
const pools = p.stagePools
	.map((list) => { return { name:list.stagePoolName, id:list.stagePoolId, set:`${bold(italic('Starters'))} \n${names(starters(list.stagePool, list.cp))}\n${bold(italic('Counterpicks'))} \n${names(list.cp)}` };});

function starters(stagelist, counterpicks) {
	const starts = stagelist.filter((id) => {return !counterpicks.includes(id);});
	return starts;
}
function names(stagelist) {
	let nameList = '';
	for (let i = 0; i < stagelist.length; i++) {
		nameList = nameList + '* ' + (s.stages.find((stage) => { return stage.sid === stagelist[i]; }).stageName + '\n');
	}
	return nameList;
}
module.exports = {
	data: new SlashCommandBuilder().setName('list').setDescription('View stage lists'),
	async execute(interaction) {
		const select = new StringSelectMenuBuilder()
			.setCustomId('starter')
			.setPlaceholder('Make a selection!')
			.addOptions(p.stagePools.map((list) => new StringSelectMenuOptionBuilder().setLabel(list.stagePoolName).setValue(list.stagePoolName)));

		const row = new ActionRowBuilder()
			.addComponents(select);

		const response = await interaction.reply({
			content: 'Choose your Stage List!',
			components: [row],
		});
		const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

		collector.on('collect', async i => {
			const selection = i.values[0];
			const picked = pools.find((c) => c.name === selection).set;
			await i.reply(`${picked}`);
		});
	},
};