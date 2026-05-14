# QA Bot

A Discord bot that connects a Minecraft account to a server so QA testers can summon it to specific lobbies via slash commands.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A Discord application with a bot token ([Discord Developer Portal](https://discord.com/developers/applications))
- A Microsoft/Minecraft account for the bot to log in with

## Setup

### 1. Install dependencies

```
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_application_id
DISCORD_GUILD_ID=your_discord_server_id
BOT_CHANNEL_ID=channel_id_where_commands_are_allowed

MC_USERNAME=bot_minecraft_email_or_username
MC_AUTH=microsoft
```

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Bot token from the Discord Developer Portal |
| `DISCORD_CLIENT_ID` | Application ID from the Discord Developer Portal |
| `DISCORD_GUILD_ID` | ID of your Discord server (right-click server → Copy Server ID) |
| `BOT_CHANNEL_ID` | ID of the channel the bot will accept commands in |
| `MC_USERNAME` | Microsoft account email for the Minecraft bot |
| `MC_AUTH` | Auth type — `microsoft` (default) or `mojang` |

### 3. Register slash commands

Run this once to register the bot's slash commands with your Discord server:

```
node deploy-commands.js
```

### 4. Start the bot

```
node index.js
```

On first run with Microsoft auth, the bot will print a URL to the console — open it in a browser and sign in to authenticate the Minecraft account. The token is cached locally for future runs.

## Discord Commands

All commands must be used in the channel set by `BOT_CHANNEL_ID`.

| Command | Description |
|---|---|
| `/summon <server> <lobby> [version]` | Connect the bot to a server and send it to a lobby (e.g. `Slipest-1`) |
| `/status` | Show current connection status |
| `/command <command>` | Run a Minecraft command as the bot (e.g. `/hub`) |
| `/message <message>` | Send a chat message as the bot |
| `/disconnect` | Disconnect the bot |

The bot auto-disconnects after 2 hours.
