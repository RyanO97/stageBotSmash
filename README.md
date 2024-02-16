# Stagebot 1.0.2
# Stage Picking - A necessary process betweeen two entrants in a fighting game tournament that decides the stages for each game in a series. 

This is Project "Stagebot"(Subject to change, please and thanks!) <br />

Developed using Discord's javascript API, Stagebot is a chat bot on the Discord platform that simulates the stage picking process between competitors in a fighting game. <br />

Several commands have been implemented so as to best simulate the stage picking process in a tournament setting. <br />

# Commands (commands beginning with slash '/')
*commands that take optional parameters where applicable. optional parameters have autocomplete for fighters and stage lists

# /data [fighter] [stagelist]
returns the list of stages that the bot has data for, given a fighter and stage list

# /sim [fighter1] [fighter2] [stagelist]
simulates the stage strike and pick process based on data for two fighters, given a stage list

# /strike [fighter] [stage list]
for use in case that the user wants to ban stages and the bot counterpicks from what is remaining in a stage list

# /pick [fighter] [stage list]
for use in case that the user want the bot to ban stages and then user counterpicks from the remaining in a stage list

# /list
for use in case that the user wants to view available stage lists according to data


# Future enhancements

enhancements to /strike and /pick to enable stage picking between users instead of bots
include an additional parameter to each command to simulate stagepicking for the game 1 of a match - a game1 flag 

# QNA
*How come not all [in-game] fighters are not available in the pick and strike commands?

I collected synthetic data by simulating games between fighter ai and recording the results. the bot's data is based on historical performance for fighters recorded on each stage. 
If the fighter does not have enough data for enough stages then they are limited in their strikes or not available at all for selection.

*How does the data evaluate strikes or pick stages?
The historical performance ranks the stages for a given fighter from best to worst. Each stage strike from a bot selects stages with their worst performance historically, and each pick is based on their best performance historically. The algorithm is in-house, and based around a specific game

*How do you decide which stages are competitive?
The set of competitive stages is arbitrary. I started collecting data based on stages used in competitions at the current time as well as alternative stages that game fans use. In the event an actual game tournament introduces a new stage aside from the existing stage the data has, data collection for said stage will be considered

*What video game(s) are you recording data for?
Current data is collected and synthesized using a copy of Super Smash Bros. Ultimate for the Nintendo Switch. In theory, other variations of this bot can use data for other video games in the event their respective develoeprs establish their own data collection methods, and an in-house algorithm to rank their fighters' best and worst stages accordingly. 

*More questions, or bug reporting?
Please feel free to contact the developer via email or discord
email: emceeromeo@gmail.com
discord: @romioh
