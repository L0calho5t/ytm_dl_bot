import { YtDlp } from 'ytdlp-nodejs';
import YTMusicAPI from "lite-ytmusic-api";
import * as fs from 'node:fs';
import * as ffmetadata from 'ffmetadata';

const ytdlp = new YtDlp();
// const ytmusic = new YTMusic();
const ytmusic = new YTMusicAPI();

await ytmusic.initialize();

// Functions begin //

async function downloadEverything(mySong, filePath, coverPath, songName, songArtist){
  await getImage(mySong, coverPath);
  await downloadVideo(mySong.videoId, mySong.title).then(() => {
    addFileMetadata(filePath, coverPath, songName, songArtist);
  });
}

async function getSongData(sn)
{
  await ytmusic.initialize();
  return await ytmusic.searchSongs(sn);
}

async function downloadVideo(songId, songname) {
  try {
    await ytdlp.execAsync(`https://music.youtube.com/watch?v=${songId}`, {
        audioFormat: 'mp3',
        output: `./img-music-tmp/${songname}.%(ext)s`,
        extractAudio: true
    }).then(console.log('Download completed:', songname));
  } catch (error) {
    console.error('Error while trying to download video');
  }
} 

async function getImage(mySong, coverPath){
  const url = mySong.thumbnail;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(coverPath, buffer);
    console.log(`Image downloaded and saved to: ./img-music-tmp/Cover_${mySong.title}.jpg`);
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