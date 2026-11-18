const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ---------- CONFIG ----------
const CONFIG = {
  // Role the fastpass gives (create it in your server and paste the ID)
  fastpassRoleId: process.env.FASTPASS_ROLE_ID || 'PUT_FASTPASS_ROLE_ID_HERE',
  // Who may issue/revoke passes (defaults to your management role)
  issuerRoleId: process.env.FASTPASS_ISSUER_ROLE_ID || '1546954610315370626',
  // Channel where grants/revokes/expiries are logged
  logChannelId: process.env.FASTPASS_LOG_CHANNEL_ID || 'PUT_LOG_CHANNEL_ID_HERE',
  serverName: 'Hampshire County Roleplay',
  color: 0x2b6cb0,
};

// ---------- STORAGE ----------
const DB_PATH = process.env.FASTPASS_DB_PATH || path.join(__dirname, 'fastpasses.json');

function load() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; }
}
function save(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

async function log(guild, embed) {
  const ch = await guild.channels.fetch(CONFIG.logChannelId).catch(() => null);
  if (ch) ch.send({ embeds: [embed] }).catch(() => {});
}

function baseEmbed(title) {
  return new EmbedBuilder()
    .setColor(CONFIG.color)
    .setTitle(title)
    .setFooter({ text: CONFIG.serverName })
    .setTimestamp();
}

// ---------- COMMAND ----------
module.exports = {
  data: new SlashCommandBuilder()
    .setName('fastpass')
    .setDescription('Manage staff fastpasses')
    .addSubcommand(s => s
      .setName('grant')
      .setDescription('Grant a staff fastpass')
      .addUserOption(o => o.setName('user').setDescription('Staff member').setRequired(true))
      .addIntegerOption(o => o.setName('days').setDescription('Days until it expires (leave empty for no expiry)').setMinValue(1).setMaxValue(365))
      .addStringOption(o => o.setName('reason').setDescription('Reason for the fastpass')))
    .addSubcommand(s => s
      .setName('revoke')
      .setDescription('Revoke a staff fastpass')
      .addUserOption(o => o.setName('user').setDescription('Staff member').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason for revoking')))
    .addSubcommand(s => s
      .setName('check')
      .setDescription("Check a staff member's fastpass")
      .addUserOption(o => o.setName('user').setDescription('Staff member').setRequired(true)))
    .addSubcommand(s => s
      .setName('list')
      .setDescription('List all active fastpasses')),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(CONFIG.issuerRoleId)) {
      return interaction.reply({ content: 'You do not have permission to manage fastpasses.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const db = load();
    const guild = interaction.guild;

    if (sub === 'grant') {
      const user = interaction.options.getUser('user');
      const days = interaction.options.getInteger('days');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (!member) return interaction.reply({ content: 'That user is not in the server.', ephemeral: true });

      const expiresAt = days ? Date.now() + days * 86400000 : null;
      try {
        await member.roles.add(CONFIG.fastpassRoleId, `Fastpass granted by ${interaction.user.tag}`);
      } catch {
        return interaction.reply({ content: 'I could not give the fastpass role. Check the role ID and that my role sits above it.', ephemeral: true });
      }

      db[user.id] = { grantedBy: interaction.user.id, grantedAt: Date.now(), expiresAt, reason };
      save(db);

      const embed = baseEmbed('Staff Fastpass Granted')
        .addFields(
          { name: 'Staff Member', value: `${user}`, inline: true },
          { name: 'Granted By', value: `${interaction.user}`, inline: true },
          { name: 'Expires', value: expiresAt ? `<t:${Math.floor(expiresAt / 1000)}:R>` : 'Never', inline: true },
          { name: 'Reason', value: reason },
        );
      await interaction.reply({ embeds: [embed] });
      await log(guild, embed);
      user.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (sub === 'revoke') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = await guild.members.fetch(user.id).catch(() =>
