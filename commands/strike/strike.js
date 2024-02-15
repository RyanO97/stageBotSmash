const { bold, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ComponentType } = require('discord.js');

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
		.setName('strike')
		.setDescription('stage strike against a bot')
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
		const a = interaction.options.getString('fighter');
		const character = characters.find((c) => c.name === a);
		const selectedPref = d.stagePrefs.find((fighter) => {return fighter.fid === character.id;}).stage_pref;
		const l = interaction.options.getString('stagelist');
		const list = pools.find((c) => c.name === l);
		const selectedPool = p.stagePools.find((stage) => {return stage.stagePoolId === list.id;}).stagePool;
		const fighterPool = selectedPref.filter((stage) => {return selectedPool.includes(stage);});
		const stageSelections = stages.filter((stage) => {return selectedPool.includes(stage.sid);}).map((sta) => new StringSelectMenuOptionBuilder().setLabel(sta.stageName).setValue(sta.stageName));
		const numBans = fighterPool.length >= 3 ? 2 : 1;
		const select = new StringSelectMenuBuilder()
			.setCustomId('strike')
			.setPlaceholder('select stage bans')
			.addOptions(stageSelections)
			.setMinValues(numBans)
			.setMaxValues(numBans);
		const row = new ActionRowBuilder()
			.addComponents(select);

		const response = await interaction.reply({
			content: 'Choose your bans',
			components: [row],
		});

		const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

		collector.on('collect', async i => {
			const selection = i.values;
			const bans = selection.map((ban) => {
				return stages.find((name) => {
					return ban === name.stageName;
				})
					.sid;
			});
			const decision = fighterPool.filter((picks) => {return !bans.includes(picks);});
			const pickName = s.stages.find((n) => {return n.sid === decision[0];}).stageName;
			await i.reply(`${character.name} picks ${bold(pickName)}!`);
		});
	},
};