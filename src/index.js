import express from 'express';
import { client, loginClient, parseSignups } from './discord.js';
const app = express();
const port = 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.listen(port, () => {
  console.log(`Listening to port ${port}..`);
  loginClient(client);
  client.on('ready', () => console.log('Bot online..'));
});

app.get('/signups/:id', async (req, res) => {
  const id = req.params.id;
  client.channels.fetch('813850172295348224').then((channel) => {
    channel.messages.fetch(id).then((msg) => {
      const json = msg.embeds
        .map((x) => x.fields)
        .flat(2)
        .slice(2);

      if (json) {
        res.json(JSON.stringify(parseSignups(json)));
      } else {
        res.status('500');
      }
    });
  });
});
