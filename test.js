import YTMusicAPI from "lite-ytmusic-api";

const ytmusic = new YTMusicAPI();

let final = [];

(async () => {
  // Initialize the API (pass custom cookies if required)
  await ytmusic.initialize();

  // Search for songs
  const data = await ytmusic.searchSongs("рассвет asteriasounds");
  for(let i of data)
  {
    if (i.type == 'SONG' || i.type == 'VIDEO')
    {
        final.push(i)
    }
  }
  console.log(final);

})();