const path = require('path');
const fs = require('fs');

// Итоговая функция сборки проекта
async function compile() {
  // Создаем папку с дистрибутивом ... ждем пока создастся ;)
  await fs.promises.mkdir(path.join(__dirname, 'project-dist'), { recursive: true });
  // Копируем туда ассеты всякие.
  copyDir(path.join(__dirname, 'assets'), path.join(__dirname, 'project-dist', 'assets'));
  // Собираем стили.
  mergeStyle();
  // Читаем шаблон в переменную.
  let temp = await rdFile(path.join(__dirname, 'template.html'));
  // Получаем массив тегов для подмены.
  const nameComponents = getNameComponents(temp);
  // Запускаем очередь сборки HTML и пишем результат в файл...
  replaceTemplate(temp, nameComponents);
}

// Запуск сборки проекта.
compile();

function replaceTemplate(template, atc){
  // Получаем итератор для переборки массива, каждый вызов iterator() возвращает следующий элемент массива
  const iterator = atc.shift.bind(atc);
  // Асинхроная функция которую необходимо перезапускать в последовательности
  const work = async function(item, temp) {
    // Считываем файл в переменную
    let component = await rdFile(path.join(__dirname, 'components', `${getName(item)}.html`));
    // Возвращаем результат подмены шаблона
    return temp.replace(item, component);
  };

  // Последовательность промисов, поочередная заменяющая шаблоны содержимым файлов.
  function runSeq( work, iterator, template) {
    return new Promise(() => {
      // Описываем функцию, которую сразу же и вызываем с параметром template;
      (function workItem(template) {
        let item = iterator();
        // Проверяем наличие элемента массива, если элемента нет, во item === undefined
        if (item){
          // Вызываем вышеописанную асинхронную функцию,
          // по завершении которой опять вызываем workItem(template) <-- параметр bind-ится
          work(item, template).then(workItem, workItem);
        } else {
          // Если элементы закончились, записываем результат в HTML-файл.
          const writer = new fs.WriteStream(path.join(__dirname, 'project-dist', 'index.html'), {encoding: 'utf-8'});
          writer.write(template);
        }
      })(template);
    });
  }

  // Запуск последовательности.
  runSeq(work, iterator, template);

}

// Прочитать файл и вернуть строкой
async function rdFile(fileName) {
  return fs.promises.readFile(fileName, 'utf-8');
}

// Получить массив тэгов из шаблона --> [ '{{name1}}', {{name2}}, ...]
function getNameComponents (source) {
  const sarr = source.split('');
  let i = 0;
  const tagArray = [];
  while (i < sarr.length) {
    if (sarr[i] === '{' && sarr[i+1] === '{') {
      let j = 2;
      while (!(sarr[i + j] === '}' && sarr[i + j + 1] === '}') && i + j + 1 < sarr.length) {
        j++;
      }
      tagArray.push(sarr.slice(i, i + j + 2).join(''));
      i += j + 1;
    } else {
      i++;
    }
  }
  return tagArray;
}

// Освободиться от экранировки '{{ name_component }}' --> 'name_component'.
function getName (tag) {
  return tag.slice(2,-2).trim();
}

// Копируем директорию
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

// Мержим стили
function mergeStyle() {
  const writer = new fs.WriteStream(
    path.join(__dirname, 'project-dist', 'style.css'),
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
}