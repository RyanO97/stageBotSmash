# Stagebot 2.0.0
# Stage Picking - A necessary process betweeen two entrants in a smash bros tournament that decides the stages for each game in a series. 

This is Project "Stagebot"(Subject to change, please and thanks!) <br />

Developed using Discord's javascript API, Stagebot is a chat bot on the Discord platform that simulates the stage picking process between competitors in a tournament Smash Bros game. <br />

Several commands have been implemented so as to best simulate the stage picking process in a smash bros tournament setting. <br />

# Commands (commands beginning with slash '/')
*commands that take optional parameters where applicable. optional parameters have autocomplete for fighters and stage lists

# /data [fighter] [stagelist]
returns the list of stages that the bot has data for, given a stage list

# /sim [fighter1] [fighter2] [stagelist]
simulates the stage strike and pick process between two bots, given a stage list

# /strike [fighter] [stage list]
for use in case that the user wants to ban stages and the bot counterpicks from what is remaining in a stage list

# /pick [fighter] [stage list]
for use in case that the user want the bot to ban stages and then user counterpicks from the remaining in a stage list

# /list
for use in case that the user wants to view available stage lists according to data


# Future enhancements

enhancements to /strike and /pick to enable picks and counterpicks between users
