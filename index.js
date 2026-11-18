const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, REST, Routes, Events, MessageFlags } = require('discord.js');
const cfg = require('./config');
const tickets = require('./handlers/tickets');
const regulations = require('./commands/regulations');

if (!cfg.TOKEN || !cfg.CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID environment variables.');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
require('./commands/fastpass').init(client);
client.commands = new Collection();

const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter((f) => f.endsWith('.js'));
for (const file of commandFiles) {
  const cmd = require(path.join(__dirname, 'commands', file));
  if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
}

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(cfg.TOKEN);
  const body = [...client.commands.values()].map((c) => c.data.toJSON());
  const route = cfg.GUILD_ID
    ? Routes.applicationGuildCommands(cfg.CLIENT_ID, cfg.GUILD_ID)
    : Routes.applicationCommands(cfg.CLIENT_ID);
  await rest.put(route, { body });
  console.log(`Registered ${body.length} slash commands ${cfg.GUILD_ID ? '(guild)' : '(global)'}.`);
}

client.once(Events.ClientReady, async (c) => {
  console.log(`Logged in as ${c.user.tag}`);
  try { await registerCommands(); } catch (err) { console.error('Command registration failed:', err); }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (!interaction.inGuild()) return;

    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (cmd) await cmd.execute(interaction);
    } else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'ticket:create') await tickets.createTicket(interaction);
      else if (interaction.customId.startsWith('reg:')) await regulations.handleSelect(interaction);
    } else if (interaction.isButton()) {
      if (interaction.customId.startsWith('ticket:')) await tickets.handleButton(interaction);
    }
  } catch (err) {
    console.error(err);
    const msg = { content: '❌ Something went wrong. Please try again or tell a developer.', flags: MessageFlags.Ephemeral };
    try {
      if (interaction.deferred || interaction.replied) await interaction.followUp(msg);
      else await interaction.reply(msg);
    } catch { /* ignore */ }
  }
});

process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));

client.login(cfg.TOKEN);
