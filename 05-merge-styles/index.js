const path = require('path');
const fs = require('fs');

const writer = new fs.WriteStream(
  path.join(__dirname, 'project-dist', 'bundle.css'),
  {encoding: 'utf-8'}
);

fs.readdir(path.join(__dirname, 'styles'), { withFileTypes: true } ,(err, data) => {
  // Если ошибка -- выбрасываем её  
  if (err) throw err;
  // Перебираем массив файлов
  data.forEach((file) => {
    // Если объект это файл, который имеет расширение css то считываем его в буффер.
    if (file.isFile() && path.extname(file.name) === '.css') {
      const rs = new fs.createReadStream(path.join(__dirname, 'styles', file.name), 'utf-8');
      const result = [];
      rs.on('readable', () => {
        let buff = rs.read();
        if (buff) result.push(buff);
      });
      rs.on('end', () => {
        writer.write(result.join(''));
      });
    }
  });
});
  