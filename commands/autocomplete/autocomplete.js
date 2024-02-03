const { bold, italic, SlashCommandBuilder } = require('discord.js');
const d = require('../../data/fighter_stage_prefs.json');
const f = require('../../data/fighters.json');
const p = require('../../data/stage_pools.json');
const s = require('../../data/stages.json');
const fighterList = d.stagePrefs.map((fighter) => {return fighter.fid;});
const pools = p.stagePools
	.map((list) => { return { name:list.stagePoolName, id:list.stagePoolId, set:`${bold(italic('Starters'))} \n${names(starters(list.stagePool, list.cp))}\n${bold(italic('Counterpicks'))} \n${names(list.cp)}` };});
const characters = f.fighters
	.filter((fighter) => {return fighterList.includes(fighter.fid);})
	.map((fighter) => {return { name:fighter.fighterName, id: fighter.fid };});

function starters(stagelist, counterpicks) {
	const starts = stagelist.filter((id) => {return !counterpicks.includes(id);});
	return starts;
}
function names(stagelist) {
	let nameList = '';
	for (let i = 0; i < stagelist.length; i++) {
		nameList = nameList + (s.stages.find((stage) => { return stage.sid === stagelist[i]; }).stageName + ',');
	}
	return nameList;
}
module.exports = {
	data: new SlashCommandBuilder()
		.setName('data')
		.setDescription('Search discordjs.guide!')
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
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused(true);
		if (focusedValue.name === 'fighter') {
			const choices = characters;
			const filtered = choices
				.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.value))
				.map(choice => ({ name: choice.name, value: choice.name }));
			await interaction
				.respond(filtered.slice(0, 25))
				.catch(() => {() => {return;};});
		}
		else if (focusedValue.name === 'stagelist') {
			const choices = pools;
			const filtered = choices
				.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.value))
				.map(choice => ({ name: choice.name, value: choice.name }));
			await interaction
				.respond(filtered.slice(0, 25))
				.catch(() => {() => {return;};});
		}

	},
	async execute(interaction) {
		const a = interaction.options.getString('fighter');
		const character = characters.find((c) => c.name === a);
		const selectedPref = d.stagePrefs.find((fighter) => {return fighter.fid === character.id;}).stage_pref;
		const l = interaction.options.getString('stagelist');
		const list = pools.find((c) => c.name === l);
		const selectedPool = p.stagePools.find((stage) => {return stage.stagePoolId === list.id;}).stagePool;
		const fighterPool = selectedPref.filter((stage) => {return selectedPool.includes(stage);});
		const fighterSet = names(fighterPool);

		interaction.reply(`user selected fighter ${character.name} and ${list.name}\n${list.set}\n${character.name} has data for ${fighterSet}`);
	},
};