const path = require('path');
const fs = require('fs');

async function compile() {
  // Создаем папку с дистрибутивом ... ждем пока создасться ;)
  await fs.promises.mkdir(path.join(__dirname, 'project-dist'), { recursive: true });
  // Копируем туда ассеты всякие.
  copyDir(path.join(__dirname, 'assets'), path.join(__dirname, 'project-dist', 'assets'));
  // Собираем стили.
  mergeStyle();
  // Читаем шаблон в переменную.
  let temp = await rdFile(path.join(__dirname, 'template.html'));
  // Получаем массив тегов подстановки.
  const nameComponents = getNameComponents(temp);
  temp = await replaceTemplate(temp, nameComponents);
}

// Запуск сборки проекта.
compile();

async function replaceTemplate(template, atc){
  atc.forEach(async (item) => {
    const component = await rdFile(path.join(__dirname, 'components', `${getName(item)}.html`));
    template = template.replace(item, component);
    const writer = new fs.WriteStream(path.join(__dirname, 'project-dist', 'index.html'), {encoding: 'utf-8'});
    writer.write(template);
  });
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

// Освободиться от экраниовки {{ name_component }} --> name_component.
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