const { SlashCommandBuilder } = require('discord.js');
const d = require('../../data/fighter_stage_prefs.json');
const f = require('../../data/fighters.json');
const fighterList = d.stagePrefs.map((fighter) => {return fighter.fid;});
const characters = f.fighters
	.filter((fighter) => {return fighterList.includes(fighter.fid);})
	.map((fighter) => {return fighter.fighterName;});
module.exports = {
	data: new SlashCommandBuilder()
		.setName('guide')
		.setDescription('Search discordjs.guide!')
		.addStringOption(option =>
			option.setName('query')
				.setDescription('Phrase to search for')
				.setAutocomplete(true)
				.setRequired(true)),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		const choices = characters;
		const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue));
		const results = filtered.map(choice => ({ name: choice, value: choice }));
		await interaction.respond(
			results.slice(0, 25),
		).catch(() => {});
	},
	async execute(interaction) {
		const s = interaction.options.getString('query');
		const selected = characters.find((p) => p === s);
		interaction.reply(`user selected ${selected}`);
	},
};