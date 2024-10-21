const { bold, strikethrough, italic, SlashCommandBuilder } = require('discord.js');
const fighterStagePrefs = require('../../data/fighterStagePrefs');
const f = require('../../data/fighters.json').fighters;
const p = require('../../data/stage_pools.json').stagePools;
const s = require('../../data/stages.json').stages;
const pools = p.map((list) => { return { name:list.stagePoolName, id:list.stagePoolId };});
/**
	 *
	 * @param {Array} ban the ordered list of stages of player that is banning stages
	 * @param {Array} pick the ordered list of stages of player that is going to pick the stage for game
	 * @returns string indicating the strike and counterpick resulsts between fighters
	 */
const stagePick = (ban, pick) => {
	if (ban.length >= 3 && pick.length >= 3) {
		const bans = [];
		bans.push(ban[ban.length - 1]);
		bans.push(ban[ban.length - 2]);
		const b1 = s.find((st) => {return st.sid === bans[0];}).stageName;
		const b2 = s.find((st2) => {return st2.sid === bans[1];}).stageName;
		const opponentPicks = pick.filter((stage) => {return !bans.includes(stage);});
		return opponentPicks.length > 1 ?
			`will ban ${strikethrough(b1)} and ${strikethrough(b2)}, and the counterpicks are ${bold(s.find((st3) => {return st3.sid === opponentPicks[0];}).stageName)} first or ${bold(s.find((st3) => {return st3.sid === opponentPicks[1];}).stageName)} second`
			: `will ban ${strikethrough(b1)} and ${strikethrough(b2)}, and the counterpick is ${bold(s.find((st3) => {return st3.sid === opponentPicks[0];}).stageName)}`;
	}
	else if ((ban.length >= 3 && pick.length == 2) || (ban.length == 2 && pick.length == 2)) {
		const bans = [];
		bans.push(ban[ban.length - 1]);
		const b1 = s.find((st) => {return st.sid === bans[0];}).stageName;
		const b2 = s.find((st2) => {return st2.sid === bans[1];}).stageName;
		const opponentPicks = pick.filter((stage) => {return bans.includes(stage);});
		return opponentPicks.length > 1 ?
			`will ban ${strikethrough(b1)} and ${strikethrough(b2)}, and the counterpicks are ${bold(s.find((st3) => {return st3.sid === opponentPicks[0];}).stageName)} first or ${bold(s.find((st3) => {return st3.sid === opponentPicks[1];}).stageName)} second`
			: `will ban ${strikethrough(b1)} and ${strikethrough(b2)}, and the counterpick is ${bold(s.find((st3) => {return st3.sid === opponentPicks[0];}).stageName)}`;
	}
	else {
		return 'does not have sufficient stage data';
	}
};
module.exports = {
	fighterStagePrefs,
	f,
	p,
	s,
	pools,
	stagePick,
	data: new SlashCommandBuilder()
		.setName('sim')
		.setDescription('simulate stage selection between bot fighters')
		.addStringOption(option =>
			option.setName('fighter1')
				.setDescription('Choose a fighter')
				.setAutocomplete(true)
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('fighter2')
				.setDescription('Choose another fighter')
				.setAutocomplete(true)
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('stagelist')
				.setDescription('Choose a stagelist')
				.setAutocomplete(true)
				.setRequired(true),
		),
	async autocomplete(interaction) {
		await fighterStagePrefs.getDataFID().then((fidArray) => {
			const characters = f
				.filter((fighter) => {return fidArray.includes(fighter.fid);})
				.map((fighter) => {return { name:fighter.fighterName, id: fighter.fid };});
			const focusedValue = interaction.options.getFocused(true);
			const choices = focusedValue.name === 'fighter1' ? characters
				: focusedValue.name === 'fighter2' ? characters
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
		// get fighters and data
		const a = interaction.options.getString('fighter1');
		const b = interaction.options.getString('fighter2');
		// filter down selections
		const characters = f
			.filter((fighter) => {return [a, b].includes(fighter.fighterName);})
			.map((fighter) => {return { name:fighter.fighterName, id: fighter.fid };});
		const f1 = characters.find((c) => c.name === a).id;
		const f2 = characters.find((c) => c.name === b).id;
		// get stage list data
		const l = interaction.options.getString('stagelist');
		const list = pools.find((c) => c.name === l);
		const selectedPool = p.find((stage) => {return stage.stagePoolId === list.id;}).stagePool;

		// get stage prefs for the selections above
		await fighterStagePrefs.fetchPrefs([f1, f2]).then((prefsArray) => {
			const f1Pref = prefsArray.find((fighter) => {return fighter.fid === f1;}).stage_pref;
			const f2Pref = prefsArray.find((fighter) => {return fighter.fid === f2;}).stage_pref;
			// filter down fighter's data based on stagelist
			const f1Pool = f1Pref.filter((stage) => {return selectedPool.includes(stage);});
			const f2Pool = f2Pref.filter((stage) => {return selectedPool.includes(stage);});
			// capture actions between players in a match
			const f1Results = stagePick(f1Pool, f2Pool);
			const f2Results = stagePick(f2Pool, f1Pool);

			interaction.reply(`For this stagelist ${bold(italic(list.name))}\n\n${a} ${f1Results}\n${b} ${f2Results}`);
		});
	},
};