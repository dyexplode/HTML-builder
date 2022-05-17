const fs = require('fs');
const path = require('path');

fs.readFile(path.join(__dirname, 'text.txt'), 'utf-8', (err, data) => {
  if (err) throw err;
  if (data) console.log(data);
});