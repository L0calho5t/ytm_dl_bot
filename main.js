import { Markup, Telegraf } from 'telegraf';
import { load } from 'ts-dotenv';
import { getSongData, downloadEverything } from './downloader.mjs';
import * as fs from 'fs';

const token = load({
	TOKEN: String,
}).TOKEN;

class Song {
  constructor(songName, artist, imageUrl, id, videoId) {
    this.name = songName;
    this.artist = artist;
    this.url = imageUrl;
    this.videoId = videoId;
    this.id = id;
  }
}

let result = [];

async function main (songname) {
  let final = [];
  let data = undefined;
  try {
    data = await getSongData(songname);
  } catch (err) {
    if(err) {
      console.log("ERROR WHILE FETCHING SONG DATA:", err);
    }
  } 
  // console.log(data);
  let tmp = 0;
  let exported = [];
  let song;
  for(let i of data) {
    if(i.type == "SONG" || i.type == "VIDEO")
    {
      // song = new Song(i.name, i.artist.name, i.thumbnails[0].url, tmp, i.videoId);
      // final.push({
      //   type: "article",
      //   id: song.id,
      //   title: song.name,
      //   description: song.artist,
      //   thumbnail_url: song.url,
      //   message_text: `/start`,
      // });
      exported.push(i);
      tmp += 1;
    }
  }
  console.log('\n---------------------------------------------\n', final, '\n###########################################\n', exported);
  return [final, song.videoId, exported];
}

const bot = new Telegraf(token);

bot.start((ctx) => {
	return ctx.reply(`Hello, ${ctx.update.message.from.first_name}`)
})

bot.on('inline_query', async (ctx) => {
  try {result = await main(ctx.inlineQuery.query);}
  catch(err)
  {
    if(err)
    {
      console.log(err);
    }
  }
  // Answer the inline query
  await ctx.answerInlineQuery(result[0]);
});

bot.on("chosen_inline_result", async (ctx) => {
  const answer = ctx.chosenInlineResult;
  console.log(`User ${answer.from.username} selected result with ID: ${answer.result_id}\n ${answer.query}`);
  // console.log(await result[0][Number(answer.result_id)], await result[1], await result[2][Number(answer.result_id)]);

  //THIS SHIT DOESN'T WORK
  //This shit catches an error when trying to read result[2][Number(answer.result_id)] because this mf is empty??? wtf help (fixed???)
  //idk i think i fixed it
  const myData = result[2][Number(answer.result_id)];
  await downloadEverything(myData, `./img-music-tmp/${myData.name}.mp3`, `./img-music-tmp/Cover_${myData.name}.jpg`, myData.name, myData.artist.name)
});

bot.command('download', (ctx) => {
  let userMessage = ctx.message.text;
  console.log(ctx.message.text);

  ctx.reply('chose hui', Markup.inlineKeyboard([]))
});

bot.launch(() => {
  console.log('Inline bot is running...');
});


function createArrayOfButtons(songs) {
  let choices = [];
  for (let i of songs) {
    choices.push(Markup.button.callback(`${i.name} by ${i.artist.name}`, i.videoId));
  }
  return choices;
}