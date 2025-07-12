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
  let choices = [];
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
  console.log(data);
  for(let i of data) {
    if(i.type == "SONG" || i.type == "VIDEO")
    {
      choices.push([
        Markup.button.callback(`${i.title} by ${i.artists}`, tmp)
      ]);
      exported.push(i);
      tmp += 1;
    }
  }
  return [choices, exported];
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
  await downloadEverything(myData, `./img-music-tmp/${myData.title}.mp3`, `./img-music-tmp/Cover_${myData.title}.jpg`, myData.title, myData.artists)
});

bot.command('download', async (ctx) => {
  let userMessage = ctx.message.text;
  userMessage = userMessage.substring(userMessage.indexOf(" ") + 1);
  console.log(userMessage);
  result = await main(userMessage);
  console.log(result[0]);
  ctx.reply("Chose what song you want to download", Markup.inlineKeyboard(result[0]));
});

bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;
  const myData = result[1][data];
  ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  ctx.reply(`You chose to download song ${myData.title} by ${myData.artists}`)
  console.log('\n', data, '\n', myData);
  try{
    await downloadEverything(myData, `./img-music-tmp/${myData.title}.mp3`, `./img-music-tmp/Cover_${myData.title}.jpg`, myData.title, myData.artists).then(() => {
      ctx.replyWithAudio(`https://hmb1te.tunnel.pyjam.as/${myData.title}.mp3`);
    });
  } catch (err) {
    if(err) {
      console.log("Error when doing something:", err);
    }     
  }
})

bot.launch(() => {
  console.log('Inline bot is running...');
});