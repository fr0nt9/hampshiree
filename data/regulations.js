// Edit anything in here to match your server. Each entry becomes one embed shown privately to the person who picks it.
// NOTE: The firearm / vehicle lists below are a starting template - check them against what is in the game right now
// (ER:LC updates often) and add/remove items.

module.exports = {
  discord: {
    title: '📜 Discord Server Rules',
    sections: [
      { name: 'Respect', rules: [
        'Treat every member and staff member with respect. Harassment, bullying, and toxicity are not tolerated.',
        'No racism, sexism, homophobia, discrimination, or hate speech of any kind.',
        'Do not argue with staff decisions in public channels. Open a support ticket instead.',
      ]},
      { name: 'Content', rules: [
        'No NSFW, gore, or otherwise inappropriate content or links.',
        'No spamming, flooding, excessive caps, or unnecessary pings.',
        'No advertising other servers, groups, or services without management approval.',
        'Keep conversations in the correct channels and in English.',
      ]},
      { name: 'Safety & Conduct', rules: [
        'Follow the Discord Terms of Service and Community Guidelines at all times.',
        'Do not share personal information about yourself or others.',
        'No impersonating staff, members, or other communities.',
        'Do not evade punishments (alt accounts, leaving and rejoining, etc.).',
        'No scams, exploits, or sharing malicious files or links.',
      ]},
    ],
  },

  ingame: {
    title: '🎮 In-Game Regulations',
    sections: [
      { name: 'Core Roleplay Rules', rules: [
        '**Fail RP:** Always roleplay realistically. Do not do things that would not happen in real life.',
        '**Fear RP:** Value your life. Act scared when a weapon is pointed at you or you are in danger.',
        '**RDM:** Do not kill or injure players without a valid roleplay reason.',
        '**VDM:** Do not run over or hit players with vehicles on purpose.',
        '**NITRP:** No Intention To Roleplay is not allowed. Take the roleplay seriously.',
        '**Cop Baiting:** Do not provoke or antagonise law enforcement for no reason.',
        '**Powergaming / Metagaming:** Do not force actions on others or use out-of-character information in-character.',
        '**Combat Logging:** Leaving mid-scene to avoid roleplay or consequences is not allowed.',
      ]},
      { name: 'Driving & Vehicles', rules: [
        'Obey traffic laws unless you are in a valid roleplay (pursuit, emergency response, etc.).',
        'No reckless driving, intentional crashing, or vehicle trolling.',
        'Do not spawn restricted vehicles you are not allowed to use.',
        'Use your correct vehicle livery for your team and department.',
      ]},
      { name: 'Teams & Staff', rules: [
        'Follow your team and department rules, ranks, and chain of command.',
        'Listen to and follow all staff instructions in-game.',
        'Do not abuse your team powers or equipment.',
        'Use of exploits, glitches, or third-party software is strictly prohibited.',
        'Follow the priority and session rules set by staff.',
      ]},
    ],
  },

  firearms: {
    title: '🔫 Restricted Firearms',
    intro: 'The following ER:LC weapons are restricted. Do not use them unless you have the permission/role required by management or a staff member has approved it for a scene. Weapons may never be used for RDM or without a valid roleplay reason.',
    sections: [
      { name: 'Pistols & Revolvers', rules: ['Beretta M9', 'Glock 17', 'Colt Python', 'Model 29', 'Desert Eagle'] },
      { name: 'Shotguns', rules: ['Remington 870', 'Mossberg 500'] },
      { name: 'SMGs', rules: ['MAC-10', 'MP5', 'UZI'] },
      { name: 'Rifles & Assault Rifles', rules: ['M4 / AR-15 variants', 'AK-47', 'Mini-14', 'SKS'] },
      { name: 'Snipers & Heavy', rules: ['Type 89', 'Remington MSR', 'Remington 700', 'Any other sniper, explosive, or heavy weapon'] },
      { name: 'Police-Only Equipment', rules: ['Police-issued firearms, tasers, spike strips, and riot gear are for law enforcement only. Civilians and criminals may not use them.'] },
    ],
  },

  roleplays: {
    title: '🚫 Restricted Roleplays',
    intro: 'These roleplays are not allowed, or require prior staff approval. If you are unsure, open a support ticket before you do it.',
    sections: [
      { name: 'Not Allowed', rules: [
        '**Terrorism:** Terrorist attacks, bomb threats, or mass-casualty events.',
        '**Mass shootings / school shootings:** Never allowed.',
        '**Sexual content:** Sexual roleplay, sexual assault, or anything sexual in nature.',
        '**Hate-based roleplay:** Racism, extremism, or discriminatory roleplay.',
        '**Self-harm / suicide:** Do not roleplay or make light of it.',
        '**Torture and extreme gore:** Excessive violence is not allowed.',
        '**Real-world tragedies:** Do not recreate real tragedies or real events.',
        '**Kidnapping of minors / anything involving child harm.**',
        '**Roblox TOS violations:** Anything that breaks the Roblox Terms of Service.',
      ]},
      { name: 'Staff Approval Required', rules: [
        'Hostage situations, large-scale heists, and prison breaks.',
        'Hijackings and takeovers of public locations.',
        'Gang wars and any large organised crime event.',
        'Custom or unusual storylines that involve multiple departments.',
      ]},
    ],
  },

  vehicles: {
    title: '🚗 Restricted Vehicles',
    intro: 'Very fast vehicles are restricted to prevent chaos and unrealistic pursuits. Some vehicles are only available to VIP / Server Booster members. Check with staff if you are unsure whether you can use a vehicle.',
    sections: [
      { name: 'Restricted - Very Fast Vehicles', rules: [
        'Hypercars and supercars (any top-speed vehicle in the game)',
        'Modified or tuned vehicles with unrealistic top speed',
        'Motorcycles and sport bikes in pursuits',
        'Any vehicle that is ruled "too fast" by staff for the current session',
      ]},
      { name: 'VIP / Server Booster Only', rules: [
        'Premium and limited-edition vehicles',
        'Custom-livery vehicles reserved for VIP or Boosters',
        'Any vehicle marked as VIP in the vehicle list',
      ]},
      { name: 'Emergency Vehicles', rules: [
        'Police, Fire/EMS, and DOT vehicles are only for the correct team members.',
        'Do not use emergency vehicles as civilians or criminals.',
      ]},
    ],
  },
};
