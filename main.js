import { Markup, Telegraf } from 'telegraf';
import { load } from 'ts-dotenv';
import { getSongData, downloadEverything } from './downloader.mjs';
import * as fs from 'fs';

const token = load({
	TOKEN: String,
}).TOKEN;

const servUrl = load({
  URL: String,
}).URL;

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

bot.command('download', async (ctx) => {
  let userMessage = ctx.message.text;
  userMessage = userMessage.substring(userMessage.indexOf(" ") + 1);
  console.log(userMessage);
  result = await main(userMessage);
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
      try{
        ctx.replyWithAudio(`${servUrl}${myData.title}.mp3`);
      } catch(err) {
        if(err){
          console.log('No file found or http server is not accessible');
          ctx.reply("Something went wrong on my side.\
                    Sorry for inconvenience.\
                    I'm most likely already working on it.\
                    If the error persists, text me on @linux_ussr");
        }
      }
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