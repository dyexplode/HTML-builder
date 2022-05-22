const path = require('path');
const fs = require('fs');

function copyDir(dir, dist) {
  // Создаем папку назначения
  fs.mkdir(dist, { recursive: true }, (err, dirCreate) => {
    // Если ошибка, то выводим её в консоль и завершаем приложение.
    if (err) return console.log(err);
    // Проверяем была ли создана папка.
    if (dirCreate) {
      // Если папка только что была создана, то копируем туда файлы.
      copyFiles(dir, dist);
    } else {
      // Если папка ранее существовала, то чистим её от старых файлов.
      removeFiles(dir, dist);
    }
  });
}

function removeFiles(dir, dist){
  const promisQu = [];
  fs.readdir(dist, {withFileTypes: true}, (err, data) => {
    if (err) console.log(err);
    data.forEach(item => {
      if (item.isFile()) promisQu.push(fs.promises.unlink(path.join(dist, item.name)));
    });
  });
  Promise.all(promisQu).then(() => {
    copyFiles(dir, dist);
  });
  
}

function copyFiles(dir, dist) {
  // Считываем данные о файлах в исходной папке
  fs.readdir(dir, {withFileTypes: true}, (err, data) => {
    // Если ошибка, то выводим её в консоль и завершаем приложение.
    if (err) return console.log(err);
    data.forEach((item) => {
      if (item.isFile()) fs.copyFile(path.join(dir, item.name), path.join(dist, item.name), () =>{});
    });
  });
}

// Выполняем функцию копирования директории copyDir( путь к исходной папке, путь к папке назначения)
copyDir(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'));