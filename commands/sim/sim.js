const { bold, strikethrough, italic, SlashCommandBuilder } = require('discord.js');
const d = require('../../data/fighter_stage_prefs.json');
// should replace above const
const fsp = require('../../data/fsp');
const f = require('../../data/fighters.json');
const p = require('../../data/stage_pools.json');
const s = require('../../data/stages.json');

const pools = p.stagePools.map((list) => { return { name:list.stagePoolName, id:list.stagePoolId };});

/**
	 *
	 * @param {Array} ban the ordered list of stages of player that is banning stages
	 * @param {Array} pick the ordered list of stages of player that is going to pick the stage for game
	 * @returns string indicating the strike and counterpick resulsts between fighters
	 */
function stagePick(ban, pick) {
	if (ban.length >= 3 && pick.length >= 3) {
		const bans = [];
		bans.push(ban[ban.length - 1]);
		bans.push(ban[ban.length - 2]);
		const b1 = s.stages.find((st) => {return st.sid === bans[0];}).stageName;
		const b2 = s.stages.find((st2) => {return st2.sid === bans[1];}).stageName;
		const opponentPicks = pick.filter((stage) => {return !bans.includes(stage);});
		return opponentPicks.length > 1 ?
			`will ban ${strikethrough(b1)} and ${strikethrough(b2)}, and the counterpicks are ${bold(s.stages.find((st3) => {return st3.sid === opponentPicks[0];}).stageName)} first or ${bold(s.stages.find((st3) => {return st3.sid === opponentPicks[1];}).stageName)} second`
			: `will ban ${strikethrough(b1)} and ${strikethrough(b2)}, and the counterpick is ${bold(s.stages.find((st3) => {return st3.sid === opponentPicks[0];}).stageName)}`;
	}
	else if ((ban.length >= 3 && pick.length == 2) || (ban.length == 2 && pick.length == 2)) {
		const bans = [];
		bans.push(ban[ban.length - 1]);
		const b1 = s.stages.find((st) => {return st.sid === bans[0];}).stageName;
		const b2 = s.stages.find((st2) => {return st2.sid === bans[1];}).stageName;
		const opponentPicks = pick.filter((stage) => {return bans.includes(stage);});
		return opponentPicks.length > 1 ?
			`will ban ${strikethrough(b1)} and ${strikethrough(b2)}, and the counterpicks are ${bold(s.stages.find((st3) => {return st3.sid === opponentPicks[0];}).stageName)} first or ${bold(s.stages.find((st3) => {return st3.sid === opponentPicks[1];}).stageName)} second`
			: `will ban ${strikethrough(b1)} and ${strikethrough(b2)}, and the counterpick is ${bold(s.stages.find((st3) => {return st3.sid === opponentPicks[0];}).stageName)}`;
	}
	else {
		return 'does not have sufficient stage data';
	}
}
module.exports = {
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
		const fighterList = d.stagePrefs.map((fighter) => {return fighter.fid;});
		const characters = f.fighters
			.filter((fighter) => {return fighterList.includes(fighter.fid);})
			.map((fighter) => {return { name:fighter.fighterName, id: fighter.fid };});
		const focusedValue = interaction.options.getFocused(true);
		if (focusedValue.name === 'fighter1') {
			const choices = characters;
			const filtered = choices
				.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.value))
				.map(choice => ({ name: choice.name, value: choice.name }));
			await interaction
				.respond(filtered.slice(0, 25))
				.catch(() => {console.error;});
		}
		else if (focusedValue.name === 'fighter2') {
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
		// redundant code must refactor and remove
		const characters = f.fighters
			.map((fighter) => {return { name:fighter.fighterName, id: fighter.fid };});
		// get fighters and data
		const a = interaction.options.getString('fighter1');
		const b = interaction.options.getString('fighter2');
		const f1 = characters.find((c) => c.name === a).id;
		const f2 = characters.find((c) => c.name === b).id;
		// get stage list data
		const l = interaction.options.getString('stagelist');
		const list = pools.find((c) => c.name === l);
		const selectedPool = p.stagePools.find((stage) => {return stage.stagePoolId === list.id;}).stagePool;

		// get stage prefs for the selections above
		await fsp().then((prefsArray) => {
			const f1Pref = prefsArray.find((fighter) => {return fighter.fid === f1;}).stage_pref;
			const f2Pref = prefsArray.find((fighter) => {return fighter.fid === f2;}).stage_pref;
			// filter down fighter's data based on stagelist
			const f1Pool = f1Pref.filter((stage) => {return selectedPool.includes(stage);});
			const f2Pool = f2Pref.filter((stage) => {return selectedPool.includes(stage);});
			// capture actions between players in a match
			const f1Results = stagePick(f1Pool, f2Pool);
			const f2Results = stagePick(f2Pool, f1Pool);

			interaction.reply(`For this stagelist ${bold(italic(list.name))}\n\n${f1.name} ${f1Results}\n${f2.name} ${f2Results}`);
		});
	},
};