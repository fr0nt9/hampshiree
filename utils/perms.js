const { PermissionFlagsBits } = require('discord.js');
const cfg = require('../config');

const isStaff = (member) => member.roles.cache.has(cfg.STAFF_ROLE_ID);
const isDev = (member) => member.roles.cache.has(cfg.DEV_ROLE_ID);
const canPostPanels = (member) =>
  isDev(member) || member.permissions.has(PermissionFlagsBits.Administrator);

module.exports = { isStaff, isDev, canPostPanels };
