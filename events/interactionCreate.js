const { bold, italic, Events } = require('discord.js');
const s = require('../data/stages.json');
const p = require('../data/stage_pools.json');
const pools = p.stagePools
	.map((list) => { return { name:list.stagePoolName, set:`${bold(italic('Starters'))} \n${names(starters(list.stagePool, list.cp))}\n${bold(italic('Counterpicks'))} \n${names(list.cp)}` };});

function starters(stagelist, counterpicks) {
	const starts = stagelist.filter((id) => {return !counterpicks.includes(id);});
	return starts;
}
function names(stagelist) {
	let nameList = '';
	for (let i = 0; i < stagelist.length; i++) {
		nameList = nameList + (s.stages.find((stage) => { return stage.sid === stagelist[i]; }).stageName + '\n');
	}
	return nameList;
}
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			}
			catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}
		}
		else if (interaction.isButton()) {
			// respond to the button
		}
		else if (interaction.isStringSelectMenu()) {
			const selected = pools.find((stage) => {return stage.name = interaction.values[0];});
			interaction.reply(`User has selected ${italic(interaction.values[0])}\n${selected.set}`);
		}
		else if (interaction.isAutocomplete()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.autocomplete(interaction);
			}
			catch (error) {
				console.error(error);
			}
		}
	},
};