const { strikethrough, bold, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ComponentType } = require('discord.js');
const { fighterStagePrefs, f, p, s, pools } = require('../../commands/sim/sim');
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
		await fighterStagePrefs.getDataFID().then((fidArray) => {
			const characters = f
				.filter((fighter) => {return fidArray.includes(fighter.fid);})
				.map((fighter) => {return { name:fighter.fighterName, id: fighter.fid };});
			const focusedValue = interaction.options.getFocused(true);
			const choices = focusedValue.name === 'fighter' ? characters
				: focusedValue.name === 'stagelist' ? pools
					: characters;
			const filtered = choices
				.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.value))
				.map(choice => ({ name: choice.name, value: choice.name }));
			interaction
				.respond(filtered.slice(0, 25))
				.catch(() => {console.error;});
		});
	},
	async execute(interaction) {
		// match user input against known fighters and stagelists
		const a = interaction.options.getString('fighter');
		const l = interaction.options.getString('stagelist');
		const character = f
			.map((fighter) => {return { name:fighter.fighterName, id: fighter.fid };})
			.find((fighter) => fighter.name === a);
		const list = pools.find((c) => c.name === l);
		const selectedPool = p.find((stage) => {return stage.stagePoolId === list.id;}).stagePool;
		await fighterStagePrefs.fetchPrefs([character.id]).then((prefsArray) => {
			// get the fighter data
			const selectedPref = prefsArray.find((fighter) => {return fighter.fid === character.id;}).stage_pref;
			const fighterPool = selectedPref.filter((stage) => {return selectedPool.includes(stage);});
			// based on fighter data, apply worst stage bans to selection list before user selection
			const strikePool = fighterPool.length >= 3 ? [fighterPool[fighterPool.length - 1], fighterPool[fighterPool.length - 2]] : [fighterPool[fighterPool.length - 1]];
			const selections = selectedPool.filter((stage) => {return !strikePool.includes(stage);});
			const stageSelections = s.filter((stage) => {return selections.includes(stage.sid);}).map((sta) => new StringSelectMenuOptionBuilder().setLabel(sta.stageName).setValue(sta.stageName));
			const strikeNames = strikePool
				.map((stage) => {
					return strikethrough(s
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
			// prompt and wait for user selection
			interaction.reply({
				content: strikeString,
				components: [row],
			}).then((response) => {
				const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });
				// bot response
				collector.on('collect', async i => {
					const selection = i.values[0];
					await i.reply(`${interaction.user} picks ${bold(selection)}!`);
				});
			});
		});
	},
};