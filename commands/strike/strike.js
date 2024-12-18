const { bold, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ComponentType } = require('discord.js');
const { fighterStagePrefs, f, p, s, pools } = require('../../commands/sim/sim');
const { autocomplete } = require('../../commands/pick/pick');
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
	autocomplete,
	async execute(interaction) {
		// get fighter data
		const a = interaction.options.getString('fighter');
		const l = interaction.options.getString('stagelist');
		const character = f
			.map((fighter) => {return { name:fighter.fighterName, id: fighter.fid };})
			.find((fighter) => fighter.name === a);
		// get selected stage list data
		const list = pools.find((c) => c.name === l);
		const selectedPool = p.find((stage) => {return stage.stagePoolId === list.id;}).stagePool;
		try {
			// determine number of strikes and stages for user to select
			const prefsArray = await fighterStagePrefs.fetchPrefs([character.id]);
			const selectedPref = prefsArray.find((fighter) => {return fighter.fid === character.id;}).stage_pref;
			const fighterPool = selectedPref.filter((stage) => {return selectedPool.includes(stage);});
			const stageSelections = s.filter((stage) => {return selectedPool.includes(stage.sid);}).map((sta) => new StringSelectMenuOptionBuilder().setLabel(sta.stageName).setValue(sta.stageName));
			const numBans = fighterPool.length >= 3 ? 2 : 1;
			const select = new StringSelectMenuBuilder()
				.setCustomId('strike')
				.setPlaceholder('select stage bans')
				.addOptions(stageSelections)
				.setMinValues(numBans)
				.setMaxValues(numBans);
			const row = new ActionRowBuilder()
				.addComponents(select);
			interaction.reply({
				content: 'Choose your bans',
				components: [row],
			}).then((response) => {
				const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });
				// bot response
				collector.on('collect', async i => {
					const selection = i.values;
					const bans = selection.map((ban) => {
						return s.find((name) => name.stageName === ban).sid;
					});
					const decision = fighterPool.filter((picks) => {return !bans.includes(picks);});
					const pickName = s.find((n) => {return n.sid === decision[0];}).stageName;
					const secondaryPick = decision.length > 1 ? s.find((n) => {return n.sid === decision[1];}).stageName : '';
					await i.reply(`${character.name} picks ${bold(pickName)}!${decision.length > 1 ? '\nSecondary pick is ' + bold(secondaryPick) + '!' : ''}`);
				});
			});	
		} catch (error) {
			console.error('Error executing request:', error);
		}
		
	},
};