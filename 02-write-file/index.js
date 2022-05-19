//const process = require('process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');

const writer = new fs.WriteStream(path.join(__dirname, 'out.txt'), {encoding: 'utf-8'});

let rl = readline.createInterface({ input, output });
// rl.write('Davaj poprobuju zapisat fail? ');


// Задаем вопрос и пишем ответ в файл. При помощи метода question
rl.question('Davaj poprobuju zapisat fail? ', (answer) => {
  if (answer === 'exit') {
    rl.write('Ia bolshe ne budu pisat v fail, potomu chto ty napisal slovo "exit"');
    rl.close();
  } else {
    writer.write(answer + '\n');
  }
});

// Просто всё пишем в файл, проверяя не написано ли слово "exit".
rl.on('line', (input) => {
  if (input === 'exit') {
    rl.write('Ia bolshe ne budu pisat v fail, potomu chto ty napisal slovo "exit"');
    rl.close();
  } else {
    writer.write(input + '\n');
  }
});

rl.on('SIGINT', () => {
  console.log('Eto bylo zhestoko, nazhat "Ctrl + C"');
  rl.close();
});
