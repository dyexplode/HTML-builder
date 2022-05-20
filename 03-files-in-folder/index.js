const path = require('path');
const fs = require('fs');
//Считываем данные о папке и обрабатываем данные в колбэке
fs.readdir(path.join(__dirname, 'secret-folder'), { withFileTypes: true } ,(err, data) => {
  // Если ошибка -- выбрасываем её  
  if (err) throw err;
  // Перебираем массив файлов
  data.forEach((file) => {
    // Если объект это файл, то считываем информацию о нем
    if (file.isFile()) {
      fs.stat(path.join(__dirname, 'secret-folder', file.name), (error, data) => {
        // Если ошибка -- выбрасываем её
        if (error) throw error;
        // Выводим все необходимые данные о файле в консоль
        console.log(`${file.name} - ${path.extname(file.name).slice(1)} - ${data.size / 1000}kb`);
      });
    }
  });

});
