require('dotenv').config()

const fs = require('fs')
const path = require('path')
const mineflayer = require('mineflayer')
const {
  Client,
  GatewayIntentBits,
  Events
} = require('discord.js')

const discord = new Client({
  intents: [GatewayIntentBits.Guilds]
})

let mcBot = null
let currentStatus = 'Offline'
let currentLobby = null
let currentVersion = null
let botChannel = null
let autoDisconnectTimer = null

function log(message) {
  console.log(message)

  if (botChannel) {
    botChannel.send(`\`\`\`${String(message).slice(0, 1900)}\`\`\``).catch(() => {})
  }
}

function moveForwardFor(ms) {
  if (!mcBot) return

  mcBot.setControlState('forward', true)

  setTimeout(() => {
    if (!mcBot) return
    mcBot.setControlState('forward', false)
  }, ms)
}

function disconnectMcBot() {
  if (!mcBot) return

  try {
    mcBot.quit()
  } catch {}

  mcBot = null
  currentStatus = 'Offline'
  currentLobby = null
  currentVersion = null
  if (autoDisconnectTimer) {
    clearTimeout(autoDisconnectTimer)
    autoDisconnectTimer = null
  }
}

function createMcBot({ host, lobby, version }) {
  disconnectMcBot()

  currentStatus = `Connecting to ${host} ${version}`
  currentLobby = lobby
  currentVersion = version

  log(`Connecting to ${host} on version ${version}...`)

  const bot = mineflayer.createBot({
    host,
    port: 25565,
    username: process.env.MC_USERNAME,
    auth: process.env.MC_AUTH || 'microsoft',
    version,
  })

  mcBot = bot

  bot.once('spawn', () => {
    currentStatus = `Online on ${host}`
    log(`Spawned on ${host}.`)

    autoDisconnectTimer = setTimeout(() => {
      if (mcBot !== bot) return
      log('Auto-disconnecting after 2 hours.')
      disconnectMcBot()
    }, 2 * 60 * 60 * 1000)

    // setTimeout(() => {
    //   if (mcBot !== bot) return
    //   moveForwardFor(1000)
    // }, 15000)

    moveForwardFor(1000)

    // setTimeout(() => {
    //   if (mcBot !== bot) return

    //   log(`Sending /server ${lobby}`)
    //   bot.chat(`/server ${lobby}`)

    //   setTimeout(() => {
    //     moveForwardFor(1000)
    //   }, 2000)
    // }, 17000)

    log(`Sending /server ${lobby}`)
      bot.chat(`/server ${lobby}`)

      setTimeout(() => {
        moveForwardFor(1000)
      }, 2000)
  })

  bot.on('messagestr', msg => {
    if (mcBot !== bot) return
    console.log('RAW:', msg)
  })

  bot.on('kicked', reason => {
    if (mcBot !== bot) return
    currentStatus = 'Kicked'
    log(`KICKED: ${JSON.stringify(reason)}`)
  })

  bot.on('end', reason => {
    if (mcBot !== bot) return
    currentStatus = 'Offline'
    log(`ENDED: ${reason || 'No reason given'}`)
    mcBot = null
  })

  bot.on('error', err => {
    if (mcBot !== bot) return
    currentStatus = 'Error'
    log(`MINECRAFT ERROR: ${err.message}`)
  })
}

discord.once(Events.ClientReady, async client => {
  console.log(`Discord bot logged in as ${client.user.tag}`)

  botChannel = await client.channels.fetch(process.env.BOT_CHANNEL_ID).catch(() => null)

  if (!botChannel) {
    console.log('WARNING: Could not find BOT_CHANNEL_ID.')
  } else {
    log('QA summon bot is online.')
  }
})

discord.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return

  if (interaction.channelId !== process.env.BOT_CHANNEL_ID) {
    await interaction.reply({ content: 'Commands can only be used in the bot channel.', ephemeral: true })
    return
  }

  try {
    if (interaction.commandName === 'summon') {
      const host = interaction.options.getString('server')
      const lobby = interaction.options.getString('lobby')
      const version = interaction.options.getString('version') || '1.8.9'

      await interaction.reply(`Summoning QA bot to \`${host}\`, then sending \`/server ${lobby}\`.`)

      createMcBot({ host, lobby, version })
      return
    }

    if (interaction.commandName === 'command') {
      const command = interaction.options.getString('command')

      if (!mcBot) {
        await interaction.reply('Minecraft bot is not online.')
        return
      }

      mcBot.chat(command.startsWith('/') ? command : `/${command}`)
      await interaction.reply(`Ran command: \`${command}\``)
      return
    }

    if (interaction.commandName === 'message') {
      const message = interaction.options.getString('message')

      if (!mcBot) {
        await interaction.reply('Minecraft bot is not online.')
        return
      }

      mcBot.chat(message)
      await interaction.reply(`Sent message: \`${message}\``)
      return
    }

    if (interaction.commandName === 'status') {
      const lobbyInfo = currentLobby ? ` | Lobby: \`${currentLobby}\`` : ''
      const versionInfo = currentVersion ? ` | Version: \`${currentVersion}\`` : ''
      await interaction.reply(`Status: \`${currentStatus}\`${lobbyInfo}${versionInfo}`)
      return
    }

    if (interaction.commandName === 'disconnect') {
      disconnectMcBot()
      await interaction.reply('Disconnected Minecraft bot.')
      return
    }
  } catch (err) {
    log(`DISCORD COMMAND ERROR: ${err.message}`)

    if (!interaction.replied) {
      await interaction.reply('An error occurred. Check the bot channel.')
    }
  }
})

discord.login(process.env.DISCORD_TOKEN)