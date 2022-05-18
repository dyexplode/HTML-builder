const fs = require('fs');
const path = require('path');

/* this if other syntaxis
fs.readFile(path.join(__dirname, 'text.txt'), 'utf-8', (err, data) => {
  if (err) throw err;
  if (data) console.log(data);
});
*/

const reader = new fs.ReadStream(path.join(__dirname, 'text.txt'), {encoding: 'utf-8'});
reader.on('readable', () => {
  let data = reader.read();
  if (data) console.log(data);
});