const { bold, strikethrough, italic, SlashCommandBuilder } = require('discord.js');
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

function stagePick(ban, pick) {
	if (ban.length >= 3 && pick.length >= 3) {
		const bans = [];
		bans.push(ban[ban.length - 1]);
		bans.push(ban[ban.length - 2]);
		const b1 = s.stages.find((st) => {return st.sid === bans[0];}).stageName;
		const b2 = s.stages.find((st2) => {return st2.sid === bans[1];}).stageName;
		const opponentPicks = pick.filter((stage) => {return !bans.includes(stage);});
		return `will ban ${strikethrough(b1)} and ${strikethrough(b2)}, and the counterpick is ${bold(s.stages.find((st3) => {return st3.sid === opponentPicks[0];}).stageName)}`;
	}
	else if ((ban.length >= 3 && pick.length == 2) || (ban.length == 2 && pick.length == 2)) {
		const bans = [];
		bans.push(ban[ban.length - 1]);
		const b1 = s.stages.find((st) => {return st.sid === bans[0];}).stageName;
		const opponentPicks = pick.filter((stage) => {return bans.includes(stage);});
		return `will ban ${strikethrough(b1)}, and the counterpick is ${bold(s.stages.find((st3) => {return st3.sid === opponentPicks[0];}).stageName)}`;
	}
	else {
		return 'does not have sufficient stage data';
	}
}
function names(stagelist) {
	let nameList = '';
	for (let i = 0; i < stagelist.length; i++) {
		nameList = nameList + `(${i + 1}. ${s.stages.find((stage) => { return stage.sid === stagelist[i]; }).stageName})\n`;
	}
	return nameList;
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
		// get input
		const a = interaction.options.getString('fighter1');
		const b = interaction.options.getString('fighter2');
		const f1 = characters.find((c) => c.name === a);
		const f2 = characters.find((c) => c.name === b);
		const f1Pref = d.stagePrefs.find((fighter) => {return fighter.fid === f1.id;}).stage_pref;
		const f2Pref = d.stagePrefs.find((fighter) => {return fighter.fid === f2.id;}).stage_pref;

		const l = interaction.options.getString('stagelist');
		const list = pools.find((c) => c.name === l);
		const selectedPool = p.stagePools.find((stage) => {return stage.stagePoolId === list.id;}).stagePool;

		const f1Pool = f1Pref.filter((stage) => {return selectedPool.includes(stage);});
		const f2Pool = f2Pref.filter((stage) => {return selectedPool.includes(stage);});

		const f1Results = stagePick(f1Pool, f2Pool);
		const f2Results = stagePick(f2Pool, f1Pool);

		interaction.reply(`For this stagelist ${bold(italic(list.name))}\n\n${f1.name} ${f1Results}\n${f2.name} ${f2Results}`);
	},
};