const { strikethrough, bold, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ComponentType } = require('discord.js');

const p = require('../../data/stage_pools.json');
const d = require('../../data/fighter_stage_prefs.json');
const f = require('../../data/fighters.json');
const s = require('../../data/stages.json');

const fighterList = d.stagePrefs.map((fighter) => {return fighter.fid;});
const pools = p.stagePools
	.map((list) => { return { name:list.stagePoolName, id:list.stagePoolId };});
const characters = f.fighters
	.filter((fighter) => {return fighterList.includes(fighter.fid);})
	.map((fighter) => {return { name:fighter.fighterName, id: fighter.fid };});
const stages = s.stages;
module.exports = {
	data: new SlashCommandBuilder()
		.setName('pick')
		.setDescription('counterpick a stage against a bot')
		.addStringOption(option =>
			option.setName('fighter')
				.setDescription('Choose your opponent')
				.setAutocomplete(true)
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('stagelist')
				.setDescription('Choose a stage list')
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
				.catch(() => {console.error;});
		}
		else if (focusedValue.name === 'stagelist') {
			const choices = pools;
			const filtered = choices
				.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.value))
				.map(choice => ({ name: choice.name, value: choice.name }));
			await interaction
				.respond(filtered.slice(0, 25))
				.catch(() => {console.error;});
		}

	},
	async execute(interaction) {
		// match user input against known fighters
		const a = interaction.options.getString('fighter');
		const character = characters.find((c) => c.name === a);

		// get the fighter data
		const selectedPref = d.stagePrefs.find((fighter) => {return fighter.fid === character.id;}).stage_pref;
		const l = interaction.options.getString('stagelist');
		const list = pools.find((c) => c.name === l);

		// filter the fighter data down to the selected stage list
		const selectedPool = p.stagePools.find((stage) => {return stage.stagePoolId === list.id;}).stagePool;
		const fighterPool = selectedPref.filter((stage) => {return selectedPool.includes(stage);});
		// based on fighter data, apply worst stage bans to selection list before user selection
		const strikePool = fighterPool.length >= 3 ? [fighterPool[fighterPool.length - 1], fighterPool[fighterPool.length - 2]] : [fighterPool[fighterPool.length - 1]];
		const selections = selectedPool.filter((stage) => {return !strikePool.includes(stage);});
		const stageSelections = stages.filter((stage) => {return selections.includes(stage.sid);}).map((sta) => new StringSelectMenuOptionBuilder().setLabel(sta.stageName).setValue(sta.stageName));

		const strikeNames = strikePool
			.map((stage) => {
				return strikethrough(stages
					.find((n) => {return n.sid === stage;}).stageName);
			});
		const strikeString = `${character.name} bans the following stages\n${strikeNames.toString()}\n Choose your stage`;

		const select = new StringSelectMenuBuilder()
			.setCustomId('pick')
			.setPlaceholder('Pick a stage')
			.addOptions(stageSelections)
			.setMinValues(1)
			.setMaxValues(1);
		const row = new ActionRowBuilder()
			.addComponents(select);

		const response = await interaction.reply({
			content: strikeString,
			components: [row],
		});

		const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

		// bot response
		collector.on('collect', async i => {
			const selection = i.values[0];
			await i.reply(`${interaction.user} picks ${bold(selection)}!`);
		});
	},
};