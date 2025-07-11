import { YtDlp } from 'ytdlp-nodejs';
import YTMusic from 'ytmusic-api';
import * as fs from 'node:fs';
import * as ffmetadata from 'ffmetadata';

const ytdlp = new YtDlp();
const ytmusic = new YTMusic();

await ytmusic.initialize();

// Functions begin //

async function downloadEverything(mySong, filePath, coverPath, songName, songArtist){
  await getImage(mySong, coverPath);
  await downloadVideo(mySong.videoId, mySong.name).then(() => {
    // const name = "./" + `${mySong.name} ` + "[" + `${mySong.videoId}` + "]" + ".mp3";

    //THIS SHIT DOESN'T WORK
    //It can't rename the file and regex is fucked up (fixed??)
    //Regexp now if fine (probably)
    const escapeRegex = str => str.replace(/[.*+?^${}()[\]\\]/g, '\\$&');
    const baseName = mySong.name.replace(/\.mp3$/i, '');
    const namePattern = new RegExp(`.*${escapeRegex(baseName)}.*\\.mp3$`, 'i');
    const files = fs.readdirSync('./');
    files.forEach(file => {
      if(namePattern.test(file))
      {
        console.log("FOUND FILE");
        fs.rename(file, filePath, (error) => {
          if(error) {
            console.log("Error renaming: ", error);
          } else {
            console.log(`File renaming successful, new name is ${mySong.name}.mp3`);
          }
        })
      }
    })
  }).then(() => {
    addFileMetadata(filePath, coverPath, songName, songArtist);
  });
}

async function getSongData(sn)
{
  return ytmusic.search(sn);
}

async function downloadVideo(songId, songname) {
  try {
    const output = await ytdlp.downloadAsync(
      `https://music.youtube.com/watch?v=${songId}`,
      {
        format: {
          filter: 'audioonly',
          type: 'mp3',
        }
      }
    );
    console.log('Download completed:', songname);
  } catch (error) {
    console.error('Error while trying to download video');
  }
} 

async function getImage(mySong, coverPath){
  const url = mySong.thumbnails[mySong.thumbnails.length - 1].url;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(coverPath, buffer);
    console.log(`Image downloaded and saved to: ./img-music-tmp/Cover_${mySong.name}.jpg`);
  }
  catch (error) {
    console.error(`Error downloading image: ${error}`);
  }
}

async function addFileMetadata(filePath, songCover, songName, songArtist) {
  let data = {
    artist: songArtist,
    title: songName
  };

  let options = [songCover];

  ffmetadata.write(filePath, data, options, (error) => {
    if(error) {
      console.log("Error writing file metadata or cover:", error)
    } else {
      console.log("Writing successfil. Metadata:\n");
      ffmetadata.read(filePath, function(err, data) {
	      if (err) console.error("Error reading metadata", err);
	      else console.log(data);
      });
    }
  })
}

export { getSongData, downloadEverything };