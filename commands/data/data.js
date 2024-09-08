const { bold, italic, SlashCommandBuilder } = require('discord.js');
const { names, starters } = require('../../commands/list/list');
const { autocomplete } = require('../../commands/pick/pick');
const { f, p, fighterStagePrefs } = require('../../commands/sim/sim');
const pools = p.stagePools
	.map((list) => { return { name:list.stagePoolName, id:list.stagePoolId, set:`${bold(italic('Starters'))} \n${names(starters(list.stagePool, list.cp))}\n${bold(italic('Counterpicks'))} \n${names(list.cp)}` };});
module.exports = {
	data: new SlashCommandBuilder()
		.setName('data')
		.setDescription('check stage data for bot')
		.addStringOption(option =>
			option.setName('fighter')
				.setDescription('Choose your fighter')
				.setAutocomplete(true)
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('stagelist')
				.setDescription('Choose your stagelist')
				.setAutocomplete(true)
				.setRequired(true),
		),
	autocomplete,
	async execute(interaction) {
		// get fighter data
		const a = interaction.options.getString('fighter');
		const l = interaction.options.getString('stagelist');
		const character = f.fighters
			.map((fighter) => {return { name:fighter.fighterName, id: fighter.fid };})
			.find((fighter) => fighter.name === a);
		const list = pools.find((c) => c.name === l);
		const selectedPool = p.stagePools.find((stage) => {return stage.stagePoolId === list.id;}).stagePool;
		// retrieve single fighter data with the given stage list
		await fighterStagePrefs.fetchPrefs([character.id]).then((prefsArray) => {
			const selectedPref = prefsArray.find((fighter) => {return fighter.fid === character.id;}).stage_pref;
			const fighterPool = selectedPref.filter((stage) => {return selectedPool.includes(stage);});
			const fighterSet = names(fighterPool);
			// bot response
			interaction.reply(`For the ruleset ${bold(italic(list.name))}\n\n${bold(italic(character.name))} has cpu data for \n${bold(fighterSet)}`);
		});
	},
};