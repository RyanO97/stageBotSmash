const { bold, italic, SlashCommandBuilder } = require('discord.js');
const { names } = require('../../commands/list/list');
const { autocomplete } = require('../../commands/pick/pick');
const { f, p, fighterStagePrefs, pools } = require('../../commands/sim/sim');
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
		const character = f
			.map((fighter) => {return { name:fighter.fighterName, id: fighter.fid };})
			.find((fighter) => fighter.name === a);
		const list = pools.find((c) => c.name === l);
		const selectedPool = p.find((stage) => {return stage.stagePoolId === list.id;}).stagePool;
		try {
			// retrieve single fighter data with the given stage list
			const prefsArray = await fighterStagePrefs.fetchPrefs([character.id]);
			const selectedPref = prefsArray.find((fighter) => {return fighter.fid === character.id;}).stage_pref;
			const fighterPool = selectedPref.filter((stage) => {return selectedPool.includes(stage);});
			const fighterSet = names(fighterPool);
			// bot response
			interaction.reply(`For the ruleset ${bold(italic(list.name))}\n\n${bold(italic(character.name))} has cpu data for \n${bold(fighterSet)}`);
		} catch (error) {
			console.error('Error executing request:', error);
		}
	},
};