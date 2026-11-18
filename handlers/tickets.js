const {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ContainerBuilder,
  ChannelType, PermissionFlagsBits, MessageFlags, EmbedBuilder,
} = require('discord.js');
const { createTranscript } = require('discord-html-transcripts');
const cfg = require('../config');
const ui = require('../utils/ui');
const { isStaff } = require('../utils/perms');

const CATEGORIES = {
  staff_report: { label: 'Staff Report', description: 'Report a staff member for misconduct', emoji: '🚨', prefix: 'staff-report' },
  general_support: { label: 'General Support', description: 'General questions or support', emoji: '💬', prefix: 'support' },
  management: { label: 'Management', description: 'Promotions, LOA, resignations, and other management matters', emoji: '📋', prefix: 'management' },
  other: { label: 'Other', description: "Anything that doesn't fit above", emoji: '📌', prefix: 'other' },
};

const TOS_TEXT = [
  '## Ticket Terms of Service',
  '• Be respectful to staff and to anyone else in your ticket.',
  '• Do not open tickets for jokes, spam, or trolling.',
  '• Only open one ticket at a time and pick the correct category.',
  '• Give clear details and evidence (screenshots / clips) where you can.',
  '• Do not ping staff repeatedly. Someone will be with you as soon as possible.',
  '• Staff Report tickets must be honest. False reports may lead to punishment.',
  '• Tickets are logged. A transcript is saved when a ticket is closed.',
  '• Abuse of the ticket system can result in removal of ticket access or a punishment.',
].join('\n');

// ---------- Support panel (/support) ----------
function buildSupportPanel() {
  const select = new StringSelectMenuBuilder()
    .setCustomId('ticket:create')
    .setPlaceholder('Select a ticket category...')
    .addOptions(Object.entries(CATEGORIES).map(([value, c]) => ({
      label: c.label, description: c.description, value, emoji: c.emoji,
    })));

  const tos = new ButtonBuilder().setCustomId('ticket:tos').setLabel('Ticket ToS').setStyle(ButtonStyle.Secondary);

  const c = ui.panel('support.png')
    .addTextDisplayComponents(ui.text('## Support Tickets'))
    .addSeparatorComponents(ui.divider())
    .addTextDisplayComponents(ui.text('Need help or want to report something? Select a category below and a private ticket will be created just for you.'))
    .addTextDisplayComponents(ui.text(
      Object.values(CATEGORIES).map((x) => `**${x.label}** — ${x.description}`).join('\n\n')
    ))
    .addSeparatorComponents(ui.divider())
    .addActionRowComponents(new ActionRowBuilder().addComponents(select))
    .addActionRowComponents(new ActionRowBuilder().addComponents(tos));
  return ui.finish(c);
}

// ---------- In-ticket panel ----------
function ticketPanel({ openerId, category, claimedBy }) {
  const cat = CATEGORIES[category] || CATEGORIES.other;
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket:claim').setLabel('Claim').setEmoji('🙋').setStyle(ButtonStyle.Success).setDisabled(!!claimedBy),
    new ButtonBuilder().setCustomId('ticket:unclaim').setLabel('Unclaim').setEmoji('↩️').setStyle(ButtonStyle.Secondary).setDisabled(!claimedBy),
    new ButtonBuilder().setCustomId('ticket:close').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger),
  );
  return new ContainerBuilder()
    .setAccentColor(cfg.COLOR)
    .addTextDisplayComponents(ui.text(`## ${cat.emoji} ${cat.label} Ticket`))
    .addSeparatorComponents(ui.divider())
    .addTextDisplayComponents(ui.text(
      `**Opened by:** <@${openerId}>\n**Category:** ${cat.label}\n**Status:** ${claimedBy ? `Claimed by <@${claimedBy}>` : 'Unclaimed'}`
    ))
    .addTextDisplayComponents(ui.text('Please describe your issue in as much detail as possible. A staff member will be with you shortly.'))
    .addSeparatorComponents(ui.divider())
    .addActionRowComponents(row)
    .addTextDisplayComponents(ui.text('-# Only staff can claim, unclaim, or close this ticket.'));
}

// Ticket state is stored in the channel topic: ticket|openerId|category|claimerId-or-none
const parseTopic = (channel) => {
  const p = (channel.topic || '').split('|');
  if (p[0] !== 'ticket') return null;
  return { openerId: p[1], category: p[2], claimedBy: p[3] && p[3] !== 'none' ? p[3] : null };
};
const makeTopic = (t) => `ticket|${t.openerId}|${t.category}|${t.claimedBy || 'none'}`;

const deny = (interaction) =>
  interaction.reply({ content: '❌ Only staff can use this.', flags: MessageFlags.Ephemeral });

// ---------- Create ----------
async function createTicket(interaction) {
  const key = interaction.values[0];
  const cat = CATEGORIES[key];
  if (!cat) return interaction.reply({ content: 'Unknown category.', flags: MessageFlags.Ephemeral });

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const guild = interaction.guild;
  const channels = await guild.channels.fetch();

  const open = channels.filter((c) => c && c.topic && c.topic.startsWith(`ticket|${interaction.user.id}|`));
  if (open.size >= cfg.MAX_TICKETS_PER_USER) {
    return interaction.editReply(`❌ You already have ${open.size} open tickets (the limit is ${cfg.MAX_TICKETS_PER_USER}). Please close one first.`);
  }

  const suffix = Math.floor(1000 + Math.random() * 9000);
  const base = `${cat.prefix}-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 70);
  const name = `${base}-${suffix}`;
  const state = { openerId: interaction.user.id, category: key, claimedBy: null };

  const allow = [
    PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks,
  ];

  let channel;
  try {
    channel = await guild.channels.create({
      name,
      type: ChannelType.GuildText,
      parent: cfg.TICKET_PARENTS[key] || cfg.TICKET_CATEGORY_ID || undefined,
      topic: makeTopic(state),
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow },
        { id: cfg.STAFF_ROLE_ID, allow },
        { id: interaction.client.user.id, allow: [...allow, PermissionFlagsBits.ManageChannels] },
      ],
    });
  } catch (err) {
    console.error(err);
    return interaction.editReply('❌ I could not create your ticket. Please tell a staff member.');
  }

  await channel.send({
    content: `<@${interaction.user.id}> <@&${cfg.STAFF_ROLE_ID}>`,
    allowedMentions: { users: [interaction.user.id], roles: [cfg.STAFF_ROLE_ID] },
  });
  await channel.send({ components: [ticketPanel(state)], flags: MessageFlags.IsComponentsV2 });
  return interaction.editReply(`✅ Your ticket has been created: ${channel}`);
}

// ---------- Buttons ----------
async function handleButton(interaction) {
  const id = interaction.customId;

  if (id === 'ticket:tos') {
    return interaction.reply({ content: TOS_TEXT, flags: MessageFlags.Ephemeral });
  }

  // Everything below is staff-only
  if (!isStaff(interaction.member)) return deny(interaction);
  const t = parseTopic(interaction.channel);
  if (!t) return interaction.reply({ content: 'This is not a ticket channel.', flags: MessageFlags.Ephemeral });

  if (id === 'ticket:claim') {
    if (t.claimedBy) {
      return interaction.reply({ content: `This ticket is already claimed by <@${t.claimedBy}>.`, flags: MessageFlags.Ephemeral });
    }
    await interaction.deferUpdate();
    t.claimedBy = interaction.user.id;
    await interaction.channel.setTopic(makeTopic(t));
    await interaction.editReply({ components: [ticketPanel(t)], flags: MessageFlags.IsComponentsV2 });
    return interaction.channel.send({ content: `✅ ${interaction.user} has claimed this ticket.`, allowedMentions: { parse: [] } });
  }

  if (id === 'ticket:unclaim') {
    if (!t.claimedBy) {
      return interaction.reply({ content: 'This ticket is not claimed.', flags: MessageFlags.Ephemeral });
    }
    await interaction.deferUpdate();
    t.claimedBy = null;
    await interaction.channel.setTopic(makeTopic(t));
    await interaction.editReply({ components: [ticketPanel(t)], flags: MessageFlags.IsComponentsV2 });
    return interaction.channel.send({ content: `↩️ ${interaction.user} has unclaimed this ticket.`, allowedMentions: { parse: [] } });
  }

  if (id === 'ticket:close') {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket:close_confirm').setLabel('Confirm close').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('ticket:close_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary),
    );
    return interaction.reply({
      content: 'Are you sure you want to close this ticket? A transcript will be saved and the channel deleted.',
      components: [row], flags: MessageFlags.Ephemeral,
    });
  }

  if (id === 'ticket:close_cancel') {
    return interaction.update({ content: 'Close cancelled.', components: [] });
  }

  if (id === 'ticket:close_confirm') {
    await interaction.update({ content: '🔒 Closing ticket...', components: [] });
    return closeTicket(interaction, t);
  }
}

async function closeTicket(interaction, t) {
  const channel = interaction.channel;
  await channel.send('🔒 This ticket is being closed. Saving transcript, this channel will be deleted in a few seconds...');

  let transcript;
  try {
    transcript = await createTranscript(channel, {
      limit: -1,
      filter: (message) => !message.author.bot, // only real people, no bot panels or announcements
      returnType: 'attachment',
      filename: `transcript-${channel.name}.html`,
      saveImages: false,
      poweredBy: false,
    });
  } catch (err) {
    console.error(err);
    return channel.send('❌ Could not generate the transcript, so I did not delete the channel. Try closing again.');
  }

  const cat = CATEGORIES[t.category] || CATEGORIES.other;
  const embed = new EmbedBuilder()
    .setColor(cfg.COLOR)
    .setTitle('Ticket Transcript')
    .addFields(
      { name: 'Ticket', value: `#${channel.name}`, inline: true },
      { name: 'Category', value: cat.label, inline: true },
      { name: 'Opened by', value: `<@${t.openerId}>`, inline: true },
      { name: 'Claimed by', value: t.claimedBy ? `<@${t.claimedBy}>` : 'Nobody', inline: true },
      { name: 'Closed by', value: `${interaction.user}`, inline: true },
    )
    .setTimestamp();

  try {
    const log = await interaction.client.channels.fetch(cfg.TRANSCRIPT_CHANNEL_ID);
    await log.send({ embeds: [embed], files: [transcript], allowedMentions: { parse: [] } });
  } catch (err) {
    console.error(err);
    return channel.send('❌ I could not send the transcript to the logs channel, so I did not delete this ticket. Check my permissions there.');
  }

  setTimeout(() => channel.delete('Ticket closed').catch(console.error), 5000);
}

module.exports = { buildSupportPanel, createTicket, handleButton };
