const {
  SlashCommandBuilder, MessageFlags, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder,
} = require('discord.js');
const cfg = require('../config');
const ui = require('../utils/ui');
const { canPostPanels } = require('../utils/perms');
const data = require('../data/regulations');

const infoMenu = () =>
  new StringSelectMenuBuilder().setCustomId('reg:info').setPlaceholder('Regulation Information').addOptions(
    { label: 'Discord Rules', description: 'Rules for the Discord server', value: 'discord', emoji: '📜' },
    { label: 'In-Game Rules', description: 'Rules for roleplaying in ER:LC', value: 'ingame', emoji: '🎮' },
  );

const restrictedMenu = () =>
  new StringSelectMenuBuilder().setCustomId('reg:restricted').setPlaceholder('Restricted Utilities').addOptions(
    { label: 'Restricted Firearms', description: 'Weapons that are restricted', value: 'firearms', emoji: '🔫' },
    { label: 'Restricted Roleplays', description: 'Roleplays that are not allowed', value: 'roleplays', emoji: '🚫' },
    { label: 'Restricted Vehicles', description: 'Fast and VIP/Booster-only vehicles', value: 'vehicles', emoji: '🚗' },
  );

function buildPanel() {
  const c = ui.panel('regulations.png')
    .addSeparatorComponents(ui.divider())
    .addTextDisplayComponents(ui.text(
      'To ensure that everyone has a high-quality, realistic, and fair roleplay experience, we have established a strict set of regulations. These rules are the foundation of our community.'
    ))
    .addTextDisplayComponents(ui.text('## Fairness & Respect'))
    .addTextDisplayComponents(ui.text(
      "Whether you're on Discord or in-game, respect is non-negotiable. Our staff team actively enforces these regulations to keep the environment safe and enjoyable for everyone. Below you can view both server rules, in-game regulations, as well as restricted items and vehicles."
    ))
    .addTextDisplayComponents(ui.text(
      '### General Regulations\n> This section allows you to view general regulations for both the **In-game** and **Discord** server rules before you roleplay, and chat within these respective channels.'
    ))
    .addActionRowComponents(new ActionRowBuilder().addComponents(infoMenu()))
    .addTextDisplayComponents(ui.text(
      '### Roleplay Restrictions\n> This section allows you to view **restricted** roleplays, items, and vehicles here within **Hampshire County Roleplay**.'
    ))
    .addActionRowComponents(new ActionRowBuilder().addComponents(restrictedMenu()))
    .addTextDisplayComponents(ui.text(
      `> Regarding these said rules, if you have any questions or concerns about anything listed within this panel, please feel free to open a support ticket in <#${cfg.SUPPORT_CHANNEL_ID}> for more information on said topics and clarifications on set rules within HCRP.`
    ));
  return ui.finish(c);
}

function buildEmbeds(entry) {
  const embeds = [];
  let current = new EmbedBuilder().setColor(cfg.COLOR).setTitle(entry.title);
  if (entry.intro) current.setDescription(entry.intro);
  let size = (entry.title.length + (entry.intro ? entry.intro.length : 0));

  for (const s of entry.sections) {
    let value = s.rules.map((r) => `• ${r}`).join('\n');
    if (value.length > 1024) value = value.slice(0, 1020) + '...';
    const add = s.name.length + value.length;
    if (current.data.fields?.length >= 20 || size + add > 5500) {
      embeds.push(current);
      current = new EmbedBuilder().setColor(cfg.COLOR);
      size = 0;
    }
    current.addFields({ name: s.name, value });
    size += add;
  }
  current.setFooter({ text: 'Hampshire County Roleplay' });
  embeds.push(current);
  return embeds;
}

async function handleSelect(interaction) {
  const entry = data[interaction.values[0]];
  if (!entry) return interaction.reply({ content: 'Unknown option.', flags: MessageFlags.Ephemeral });
  const embeds = buildEmbeds(entry);
  await interaction.reply({ embeds: embeds.slice(0, 1), flags: MessageFlags.Ephemeral });
  for (const e of embeds.slice(1)) await interaction.followUp({ embeds: [e], flags: MessageFlags.Ephemeral });
}

module.exports = {
  data: new SlashCommandBuilder().setName('regulations').setDescription('Post the regulations panel in this channel'),
  async execute(interaction) {
    if (!canPostPanels(interaction.member)) {
      return interaction.reply({ content: '❌ You do not have permission to use this.', flags: MessageFlags.Ephemeral });
    }
    return ui.postPanel(interaction, buildPanel(), 'regulations.png');
  },
  handleSelect,
};
