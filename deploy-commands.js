require('dotenv').config()

const { REST, Routes, SlashCommandBuilder } = require('discord.js')

const SERVER_CHOICES = [
  { name: 'Live', value: 'mineplex.com' },
  { name: 'Staging', value: 'critz.gg' }
]

const commands = [
  new SlashCommandBuilder()
    .setName('summon')
    .setDescription('Summon the QA Minecraft account to a server/lobby')
    .addStringOption(option =>
      option
        .setName('server')
        .setDescription('Minecraft server IP')
        .setRequired(true)
        .addChoices(...SERVER_CHOICES)
    )
    .addStringOption(option =>
      option
        .setName('lobby')
        .setDescription('Lobby/server name, example: Slipest-1')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('version')
        .setDescription('Minecraft version (default: 1.8.9)')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('command')
    .setDescription('Run a Minecraft command as the QA bot')
    .addStringOption(option =>
      option
        .setName('command')
        .setDescription('Command to run, example: /hub')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('message')
    .setDescription('Send a chat message as the QA bot')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Message to send')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Show the Minecraft bot status'),

  new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('Disconnect the Minecraft bot')
].map(command => command.toJSON())

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)

async function main() {
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.DISCORD_CLIENT_ID,
      process.env.DISCORD_GUILD_ID
    ),
    { body: commands }
  )

  console.log('Slash commands deployed.')
}

main().catch(console.error)