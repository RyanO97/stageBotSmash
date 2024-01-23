const { bold, italic, Events } = require('discord.js');
const s = JSON.parse(require('fs').readFileSync('./data/stages.json'));
const p = JSON.parse(require('fs').readFileSync('./data/stage_pools.json'));

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
			const data = p.stagePools.filter((pool) => {return pool.stagePoolName === interaction.values[0];});
			interaction.reply(`User has selected ${italic(interaction.values[0])}\nwith Starters \n${bold(names(starters(data[0].stagePool, data[0].cp)))}and Counterpicks \n${bold(names(data[0].cp))}`);
		}
	},
};