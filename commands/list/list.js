const { bold, italic, ComponentType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const { p, s } = require('../../commands/sim/sim');
/**
 *
 * @param {Array} stagelist the list of id's to return stage names
 * @returns string stage names of each id in array
 */
const names = (stagelist) => {
	let nameList = '';
	for (let i = 0; i < stagelist.length; i++) {
		nameList = `${nameList}* ${s.find((stage) => { return stage.sid === stagelist[i]; }).stageName}\n`;
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

const pools = p
	.map((list) => { return { name:list.stagePoolName, id:list.stagePoolId, set:`${bold(italic('Starters'))} \n${names(starters(list.stagePool, list.cp))}\n${bold(italic('Counterpicks'))} \n${names(list.cp)}` };});

module.exports = {
	starters,
	names,
	data: new SlashCommandBuilder().setName('list').setDescription('View stage lists'),
	async execute(interaction) {
		const select = new StringSelectMenuBuilder()
			.setCustomId('starter')
			.setPlaceholder('Make a selection!')
			.addOptions(pools.map((list) => new StringSelectMenuOptionBuilder().setLabel(list.name).setValue(list.name)));
		const row = new ActionRowBuilder()
			.addComponents(select);
		await interaction.reply({
			content: 'Choose your Stage List!',
			components: [row],
		}).then((response) => {
			const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });
			collector.on('collect', async i => {
				const selection = i.values[0];
				const picked = pools.find((c) => c.name === selection).set;
				await i.reply(`Stage list for ${bold(selection)}\n${picked}`);
			});
		});
	},
};