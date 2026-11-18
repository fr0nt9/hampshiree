const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle,
} = require('discord.js');

const CONFIG = {
  staffRoleId: process.env.STAFF_ROLE_ID || '1546923626756968468',
  reviewChannelId: process.env.FASTPASS_REVIEW_CHANNEL_ID || '1546923836988203149',
  mgmtPingRoleId: '1546923599942778890',
  reviewerRoleIds: [
    '1546972075489624084', // directive team
    '1546923599942778890', // management team
    '1546923605122621523', // lead internal affairs
    '1548301273122472070', // high rank
    '1546923612811038742', // admin team
  ],
  color: 0x2b6cb0,
};

// text = full question (shown to reviewers), label = shortened for the form (45 char limit)
const QUESTIONS = [
  { text: 'What does RDM stand for?', max: 100 },
  { text: 'What does VDM stand for?', max: 100 },
  { text: 'What does NLR stand for?', max: 100 },
  { text: 'What does LTAP stand for?', max: 100 },
  { text: 'What does FRP stand for?', max: 100 },
  { text: 'Give me a example of RDM', long: true, max: 300 },
  { text: 'Give me a example of VDM', long: true, max: 300 },
  { text: 'Give me a example of NLR', long: true, max: 300 },
  { text: 'Give me a example of LTAP', long: true, max: 300 },
  { text: 'Give me a example of FRP', long: true, max: 300 },
  { text: 'How would you punish people that break these rules?', label: 'Punishment for breaking these rules?', long: true, max: 500 },
  { text: 'Do you have experience using Melonly?', long: true, max: 200 },
  { text: 'Do you have past staff experience in-game?', long: true, max: 300 },
  { text: 'Do you have past staff experience in-discord? (If so provide proof.)', label: 'Past staff experience in-Discord?', ph: 'If so, provide proof (links/screenshots)', long: true, max: 400 },
];

const PER_PAGE = 5;
const PAGES = Math.ceil(QUESTIONS.length / PER_PAGE);
const pending = new Set();
const sessions = new Map();

function buildModal(page) {
  const modal = new ModalBuilder()
    .setCustomId(`fp_modal_${page}`)
    .setTitle(`Staff Fastpass (Part ${page + 1}/${PAGES})`);
  QUESTIONS.slice(page * PER_PAGE, (page + 1) * PER_PAGE).forEach((qs, n) => {
    const idx = page * PER_PAGE + n;
    const input = new TextInputBuilder()
      .setCustomId(`q${idx}`)
      .setLabel(qs.label || qs.text)
      .setStyle(qs.long ? TextInputStyle.Paragraph : TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(qs.max);
    if (qs.ph) input.setPlaceholder(qs.ph);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
  });
  return modal;
}

const EXPIRED = 'Your application timed out. Press Apply for Fastpass to start again.';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fastpass')
    .setDescription('Post the staff fastpass application panel'),

  async execute(interaction) {
   if (!interaction.member.roles.cache.some(r => CONFIG.reviewerRoleIds.includes(r.id))) {
      return interaction.reply({ content: 'You do not have permission to post the panel.', ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setColor(CONFIG.color)
      .setTitle('Staff Fastpass')
      .setDescription(`Apply for staff with the fastpass application. It has ${PAGES} short parts and takes a few minutes.\n\nPress the button below to start.`)
      .setFooter({ text: 'Hampshire County Roleplay' });
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('fp_apply').setLabel('Apply for Fastpass').setStyle(ButtonStyle.Primary)
    );
   await ch.send({
  content: `<@&${CONFIG.mgmtPingRoleId}> New staff fastpass application from ${i.user}`,
  embeds: [embed],
  components: [row],
  allowedMentions: { roles: [CONFIG.mgmtPingRoleId] },
});
    return interaction.reply({ content: 'Panel posted.', ephemeral: true });
  },

  init(client) { console.log('fastpass listener ready');
    client.on('interactionCreate', async (i) => {
      try {
        // Apply button -> start part 1
        if (i.isButton() && i.customId === 'fp_apply') {
          if (pending.has(i.user.id)) {
            return i.reply({ content: 'You already have an application waiting for review.', ephemeral: true });
          }
          sessions.set(i.user.id, {});
          return i.showModal(buildModal(0));
        }

        // Continue button -> next part
        const next = i.isButton() && i.customId.match(/^fp_next_(\d+)$/);
        if (next) {
          if (!sessions.has(i.user.id)) return i.reply({ content: EXPIRED, ephemeral: true });
          return i.showModal(buildModal(Number(next[1])));
        }

        // A part was submitted
        const sub = i.isModalSubmit() && i.customId.match(/^fp_modal_(\d+)$/);
        if (sub) {
          const page = Number(sub[1]);
          let session = page === 0 ? {} : sessions.get(i.user.id);
          if (!session) return i.reply({ content: EXPIRED, ephemeral: true });
          QUESTIONS.slice(page * PER_PAGE, (page + 1) * PER_PAGE).forEach((_, n) => {
            const idx = page * PER_PAGE + n;
            session[idx] = i.fields.getTextInputValue(`q${idx}`);
          });
          sessions.set(i.user.id, session);

          if (page < PAGES - 1) {
            const row = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId(`fp_next_${page + 1}`).setLabel(`Continue to Part ${page + 2}`).setStyle(ButtonStyle.Primary)
            );
            return i.reply({ content: `Part ${page + 1} of ${PAGES} saved. Press the button to continue.`, components: [row], ephemeral: true });
          }

          // Last part: send everything to the review channel
          const ch = await i.guild.channels.fetch(CONFIG.reviewChannelId).catch(() => null);
          if (!ch) return i.reply({ content: 'Applications are not set up yet. Please tell management.', ephemeral: true });
          const embed = new EmbedBuilder()
            .setColor(CONFIG.color)
            .setTitle('New Staff Fastpass Application')
            .setDescription(`Applicant: ${i.user} (${i.user.id})`)
            .addFields(QUESTIONS.map((qs, idx) => ({
              name: `${idx + 1}. ${qs.text}`.slice(0, 256),
              value: session[idx] || 'No answer',
            })))
            .setTimestamp();
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`fp_accept_${i.user.id}`).setLabel('Accept').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`fp_deny_${i.user.id}`).setLabel('Deny').setStyle(ButtonStyle.Danger)
          );
          await ch.send({ embeds: [embed], components: [row] });
          pending.add(i.user.id);
          sessions.delete(i.user.id);
          return i.reply({ content: 'Your fastpass application was submitted. You will get a DM with the result.', ephemeral: true });
        }

        // Accept / Deny
        if (i.isButton() && /^fp_(accept|deny)_/.test(i.customId)) {
          if (!i.member.roles.cache.some(r => CONFIG.reviewerRoleIds.includes(r.id))) {
            return i.reply({ content: 'You cannot review applications.', ephemeral: true });
          }
          const [, action, userId] = i.customId.split('_');
          const accepted = action === 'accept';
          const member = await i.guild.members.fetch(userId).catch(() => null);
          if (accepted && member) {
            await member.roles.add(CONFIG.staffRoleId, `Fastpass accepted by ${i.user.tag}`);
          }
          if (member) {
            member.send(accepted
              ? 'Congratulations! Your staff fastpass application for Hampshire County Roleplay was accepted.'
              : 'Your staff fastpass application for Hampshire County Roleplay was not accepted this time.'
            ).catch(() => {});
          }
          pending.delete(userId);
          const embed = EmbedBuilder.from(i.message.embeds[0])
            .setColor(accepted ? 0x2ecc71 : 0xe74c3c)
            .addFields({ name: accepted ? 'Accepted by' : 'Denied by', value: `${i.user}` });
          return i.update({ embeds: [embed], components: [] });
        }
      } catch (e) {
        console.error('fastpass error:', e);
        if (!i.replied && !i.deferred) {
          i.reply({ content: 'Something went wrong. Please tell management.', ephemeral: true }).catch(() => {});
        }
      }
    });
  },
};
