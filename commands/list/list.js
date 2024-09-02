const { bold, italic, ComponentType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');

const p = require('../../data/stage_pools.json');
const s = require('../../data/stages.json');
/**
 *
 * @param {Array} stagelist the list of id's to return stage names
 * @returns string stage names of each id in array
 */
const names = async (stagelist) => {
	let nameList = '';
	for (let i = 0; i < stagelist.length; i++) {
		nameList = `${nameList}* ${s.stages.find((stage) => { return stage.sid === stagelist[i]; }).stageName}\n`;
	}
	return nameList;
};

/**
 *
 * @param {Array} stagelist the complete list of stages
 * @param {Array} counterpicks the array of stages tagged as counterpicks
 * @returns Array of id's of starter stages, used in a game 1 of a match
 */
const starters = (stagelist, counterpicks) => {
	const starts = stagelist.filter((id) => {return !counterpicks.includes(id);});
	return starts;
};

const pools = p.stagePools
	.map((list) => { return { name:list.stagePoolName, id:list.stagePoolId, set:`${bold(italic('Starters'))} \n${names(starters(list.stagePool, list.cp))}\n${bold(italic('Counterpicks'))} \n${names(list.cp)}` };});

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
			await i.reply(`Stage list for ${bold(selection)}\n${picked}`);
		});
	},
};