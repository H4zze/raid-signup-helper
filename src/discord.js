import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { Client, Intents } from 'discord.js';

export const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER'],
});
export const loginClient = (client) => client.login(process.env.TOKEN);

const cleanString = (text) =>
  text.replaceAll('**', '').replaceAll(':', '').toLowerCase();

export const parseSignups = (json) => {
  const output = {
    Total: 0,
    Tanks: 0,
    Dps: 0,
    Ranged: 0,
    Healers: 0,
    Classes: {
      druid: [],
      hunter: [],
      mage: [],
      rogue: [],
      paladin: [],
      priest: [],
      shaman: [],
      tank: [],
      warlock: [],
      warrior: [],
      late: [],
      absence: [],
    },
  };
  json.map((obj, i) => {
    if (!i) {
      output.Total = +obj.value
        .match(/\*\*\d+\*\*/)
        .shift()
        .replaceAll('**', '');
    } else if (i <= 3) {
      const match = obj.value.match(/(:[a-z]+:)|(\*\*\s?\d+\*\*)/gi);
      const cleanedRoleCount = match
        .join()
        .replaceAll(':', '')
        .replaceAll('*', '')
        .replaceAll(' ', '')
        .split(',');

      let rangedParsed = false;
      let healersParsed = false;
      cleanedRoleCount.forEach((e) => {
        switch (e) {
          case 'Tanks':
            output.Tanks = +cleanedRoleCount[1];
            break;
          case 'Dps':
            output.Dps = +cleanedRoleCount[2];
            break;
          case 'Ranged':
            output.Ranged = +cleanedRoleCount[1];
            rangedParsed = true;
            break;
          case 'Healers':
            output.Healers = +cleanedRoleCount[1];
            healersParsed = true;
            break;
          default:
            break;
        }
      });
    } else {
      const matched = obj.value.match(
        /(:[a-z]+\d?:)|(\*\*\w+.\*\*)|(\*\*\w+.\w+.\*\*)|(\*\*\w+.+\w+\*\*)/gi
      );

      if (matched) {
        const c = cleanString(matched.shift());
        if (c === 'Absence') {
          matched.forEach((e) => {
            const split = e.split(',');
            split.forEach((s) => {
              output.Classes[c].push(cleanString(s));
            });
          });
        } else if (output.Classes[c]) {
          let char = {};

          matched.forEach((e, i) => {
            if (i % 2 === 0 && i !== 0) {
              output.Classes[c].push(char);
              char = {};
            }

            switch (e.substring(0, 1)) {
              case ':':
                char['spec'] = cleanString(e);
                break;
              case '*':
                char['name'] = cleanString(e);
              default:
                break;
            }
            char['className'] = c;
          });
          output.Classes[c].push(char);
        }
      }
    }
  });

  return output;
};
