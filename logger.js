const { EmbedBuilder, AuditLogEvent } = require('discord.js');

const CHANNELS = {
  commands: '1572683635474038886',
  alerts: '1572683732782157935',
  audit: '1572683757650190356',
};

// Abuse alert: this many interactions (commands, buttons, forms) from one user inside the window
const ABUSE = { limit: 10, windowMs: 10000, cooldownMs: 60000 };
// Optional role to ping on crashes and abuse (set ALERT_PING_ROLE_ID in Railway)
const PING_ROLE = process.env.ALERT_PING_ROLE_ID || null;
const FENCE = '`'.repeat(3);

let client = null;
const hits = new Map();
const lastAlert = new Map();

const mk = (title, color) => new EmbedBuilder().setTitle(title).setColor(color).setTimestamp();
const fmt = (v) => (v === undefined || v === null) ? 'none' : typeof v === 'object' ? JSON.stringify(v) : String(v);

async function send(key, embed, ping = false) {
  if (!client) return;
  try {
    const ch = await client.channels.fetch(CHANNELS[key]);
    const role = ping && PING_ROLE;
    await ch.send({
      content: role ? `<@&${PING_ROLE}>` : undefined,
      embeds: [embed],
      allowedMentions: role ? { roles: [PING_ROLE] } : { parse: [] },
    });
  } catch (e) {
    console.error(`logger: could not send to ${key} channel:`, e.message);
  }
}

function trackAbuse(i) {
  const now = Date.now();
  const arr = (hits.get(i.user.id) || []).filter((t) => now - t < ABUSE.windowMs);
  arr.push(now);
  hits.set(i.user.id, arr);
  if (arr.length >= ABUSE.limit && now - (lastAlert.get(i.user.id) || 0) > ABUSE.cooldownMs) {
    lastAlert.set(i.user.id, now);
    const last = i.isChatInputCommand() ? i.toString() : (i.customId || 'unknown');
    send('alerts', mk('Possible Abuse Detected', 0xe74c3c)
      .setDescription(`${i.user} (${i.user.id}) triggered ${arr.length} interactions in ${ABUSE.windowMs / 1000}s.`)
      .addFields({ name: 'Last interaction', value: String(last).slice(0, 1000) }), true);
  }
}

async function crash(title, err) {
  console.error(title, err);
  await Promise.race([
    send('alerts', mk(title, 0xe74c3c)
      .setDescription(FENCE + String((err && err.stack) || err).slice(0, 1500) + FENCE), true),
    new Promise((r) => setTimeout(r, 3000)),
  ]);
  process.exit(1);
}

function init(c) {
  client = c;

  // ---- Command log + abuse detection ----
  client.on('interactionCreate', (i) => {
    trackAbuse(i);
    if (!i.isChatInputCommand()) return;
    send('commands', mk('Command Used', 0x3498db).addFields(
      { name: 'User', value: `${i.user} (${i.user.id})`, inline: true },
      { name: 'Channel', value: `${i.channel || 'DM'}`, inline: true },
      { name: 'Command', value: '`' + i.toString().slice(0, 1000) + '`' },
    ));
  });

  setInterval(() => {
    const now = Date.now();
    for (const [id, arr] of hits) {
      if (!arr.some((t) => now - t < ABUSE.windowMs)) hits.delete(id);
    }
  }, 5 * 60 * 1000).unref();

  // ---- Bot status alerts ----
  let started = false;
  const onReady = () => {
    if (started) return;
    started = true;
    send('alerts', mk('Bot Online', 0x2ecc71).setDescription(
      `${client.user.tag} is online in ${client.guilds.cache.size} server(s). If you did not just deploy, the bot restarted after a crash.`
    ));
  };
  client.once('ready', onReady);
  client.once('clientReady', onReady);
  if (client.isReady()) onReady();

  client.on('shardDisconnect', (event, id) => {
    send('alerts', mk('Bot Disconnected', 0xe67e22)
      .setDescription(`Shard ${id} lost its connection to Discord (code ${event.code}).`));
  });
  client.on('shardResume', (id) => {
    send('alerts', mk('Bot Reconnected', 0x2ecc71).setDescription(`Shard ${id} is back online.`));
  });
  client.on('error', (e) => {
    send('alerts', mk('Client Error', 0xe67e22)
      .setDescription(FENCE + String((e && e.message) || e).slice(0, 1500) + FENCE));
  });

  process.on('uncaughtException', (e) => crash('Bot Crashed (uncaught exception)', e));
  process.on('unhandledRejection', (e) => crash('Bot Crashed (unhandled rejection)', e));

  // ---- Audit log: mirrors your server's Discord audit log ----
  client.on('guildAuditLogEntryCreate', async (entry) => {
    try {
      const changes = (entry.changes || [])
        .map((ch) => `${ch.key}: ${fmt(ch.old)} -> ${fmt(ch.new)}`)
        .join('\n')
        .slice(0, 1000);
      const embed = mk('Audit Log: ' + (AuditLogEvent[entry.action] || entry.action), 0x9b59b6).addFields(
        { name: 'By', value: entry.executor ? `${entry.executor} (${entry.executor.id})` : 'Unknown', inline: true },
        { name: 'Target ID', value: String(entry.targetId || 'none'), inline: true },
        { name: 'Reason', value: String(entry.reason || 'No reason given').slice(0, 1000) },
      );
      if (changes) embed.addFields({ name: 'Changes', value: changes });
      send('audit', embed);
    } catch (e) {
      console.error('logger: audit entry failed:', e.message);
    }
  });
}

module.exports = init;
// Lets other commands write their own audit entries
module.exports.audit = (title, fields = []) => send('audit', mk(title, 0x9b59b6).addFields(fields));
