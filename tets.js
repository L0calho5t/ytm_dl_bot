let mySong = "Never Gonna Give You Up (2022 Remaster).mp3";

let notMySong = "Never Gonna Give You Up (2022 Remaster) [3BFTio5296w].mp3"

const escapeRegex = str => str.replace(/[.*+?^${}()[\]\\]/g, '\\$&');

const baseName = mySong.replace(/\.mp3$/i, '');
const regex = new RegExp(`.*${escapeRegex(baseName)}.*\\.mp3$`, 'i');

// Test cases
console.log(regex.test("[jrvbe] ervhbearvhk Never Gonna Give You Up (2022 Remaster) [3BFTio5296w].mp3")); // true
console.log(regex.test("Never Gonna Give You Up (2022 Remaster).mp3"));                       // true
console.log(regex.test("Some Other Song.mp3"));                                               // false
console.log(regex.test(notMySong));  