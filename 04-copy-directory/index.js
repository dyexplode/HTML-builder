const path = require('path');
const fs = require('fs');

function copyDir(dir, dist) {
  fs.mkdir(dist, { recursive: true }, (err) => {
    if (err) throw err;
    fs.readdir(dir, {withFileTypes: true}, (err, data) => {
      if (err) throw err;
      data.forEach((item) => {
        if (item.isFile()) fs.copyFile(path.join(dir, item.name), path.join(dist, item.name), () =>{});
        if (item.isDirectory()) copyDir(path.join(dir, item.name), path.join(dist, item.name), () =>{});
      });
    });
  });
}

copyDir(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'));