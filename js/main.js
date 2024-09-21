import { Card, AmazingCard } from './card.js'

const WAIT_TIME_MS = 1; // анимационная задержка появления поля карт
const TICK = 1000; // скорость счетчика (1000 = 1 сек)
const TICK_OPEN = 500; // скорость закрытия карт, если неугадано
const PAIR = 2; // кол-во открываемых пар
const MINUTES = 1; // минут на игру
const SECONDS = 0; // секунд на игру (плюсуются к минутам)
const LEVELS = 5; // кол-во уровней (2х2, 4х4 ...)
let min = MINUTES; // переменная минут для таймера
let sec = SECONDS; // переменная секунд для таймера
let inputNum; // объявляем переменную ввода
let timerCount; // объявляем переменную счетчика
let totalCards; // объявляем переменную общего кол-ва карт на поле
let clickCounter = 0; // объявляем счетчик кликов по картам
let totalDefined; // объявляем счетчик угаданных карт
let startBtn = document.querySelector('.btn'); // идентифицируем кнопку
let nullTimer; // для определения окончания времени
let cardsMass = []; // массив карт

document.addEventListener('DOMContentLoaded', () => {

  let timerNumber = document.querySelector('.timer');
  timerNumber.textContent = timerToPage(min, sec); // устанавливаем стартовый таймер на страницу

  // определяем ключевые элементы
  let gameResult = document.querySelector('.game-result');
  let gameTitle = document.querySelector('.game-title');
  let gameTime = document.querySelector('.game-time');
  let gameStat = document.querySelector('.game-stat');

  // заполняем localstorage если оно пустое (при первом открытии страницы)
  if (localStorage.length == 0 || Object.keys(localStorage).indexOf('records') < 0) {
    let e = [];
    for (let i = 0; i < LEVELS; i++) {
      let obj = { [i]: { time: 0, defined: 0, opened: 0, effective: 0 } };
      e.push(obj);
      localStorage.setItem('records', JSON.stringify(e));
    }
  }

  // заполняем страницу данными из localstorage
  let recordMass = JSON.parse(localStorage.getItem('records'));
  for (const i in recordMass) {
    let recordt = document.querySelector(`#recordt${i}`);
    let recordd = document.querySelector(`#recordd${i}`);
    let recordo = document.querySelector(`#recordo${i}`);
    let recordr = document.querySelector(`#recordr${i}`);
    let item = recordMass[i];
    recordt.textContent = `Время: ${item[i].time}`;
    recordd.textContent = `Найдено карт: ${item[i].defined}`;
    recordo.textContent = `Открыто карт: ${item[i].opened}`;
    recordr.textContent = `Результативность: ${item[i].effective}%`;
  }

  // функция чтения рекорда из localstorage
  function getData(level, item) {
    let obj = JSON.parse(localStorage.getItem('records'));
    return obj[level][level][item];
  }

  // функция записи рекорда на страницу и в localstorage
  function setData(level, item, vol) {
    // в localstorage
    let obj = JSON.parse(localStorage.getItem('records'));
    obj[level][level][item] = vol;
    localStorage.setItem('records', JSON.stringify(obj));

    // в документ
    if (item == "time") {
      let recordt = document.querySelector(`#recordt${level}`);
      recordt.textContent = `Время: ${vol}`;
    }
    if (item == "defined") {
      let recordd = document.querySelector(`#recordd${level}`);
      recordd.textContent = `Найдено карт: ${vol}`;
    }
    if (item == "opened") {
      let recordo = document.querySelector(`#recordo${level}`);
      recordo.textContent = `Открыто карт: ${vol}`;
    }
    if (item == "effective") {
      let recordr = document.querySelector(`#recordr${level}`);
      recordr.textContent = `Результативность: ${vol}%`;
    }
  }

  // функция нормализации времени
  function timerToPage(minute, second) {
    let value;
    if (String(second).length == 1) value = `${minute}:0${second}`;
    else value = `${minute}:${second}`;
    return value;
  }

  // функция, генерирующую массив парных чисел
  let createNumbersArray = (count) => {
    let mass = [];
    for (let i in count) {
      mass.push(count[i], count[i]);
    }
    return mass;
  }

  // функция перемешивания массива
  let shuffle = (arr) => {
    for (let i in arr) {
      let j = Math.floor(Math.random() * (arr.length - 1));
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  // функция создания карточек
  function createGameField(itemClass) {
    inputNum = input.value;
    // условия ограничивающие ошибочный ввод
    if (!inputNum || !Number.isInteger(inputNum / 2) || (inputNum < 0 || inputNum > 10)) inputNum = 4;

    totalCards = Math.pow(inputNum, 2); // общее число карточек

    // создаем массив со значениями карточек
    let massive = [];
    for (let i = 1; i <= totalCards / 2; i++) {
      massive.push(i);
    }
    let cardId = shuffle(createNumbersArray(massive));

    // создаем элемент ul и присваиваем ему классы
    let block = document.querySelector('.game-block');
    let cards = document.createElement('ul');
    cards.classList.add('list', 'flex');

    // устанавливаем количество колонок карточек
    document.documentElement.style.setProperty('--columns', inputNum);
    //расстояние между ними, если карточек много
    if (inputNum > 5) document.documentElement.style.setProperty('--gap', '10px');
    if (inputNum > 8) document.documentElement.style.setProperty('--gap', '7px');

    block.append(cards); // в div добавляем ul

    // устанавливаем задержку появления карточек для красоты
    cardCreate();
    let i = 1;
    function cardCreate() {
      setTimeout(() => {
        const newCard = new AmazingCard('.list', cardId[i - 1], itemClass, function (newCard) { }, i);
        // ставим умолчания
        newCard.open = false;
        newCard.success = false;
        // добавляем карточки в массив
        cardsMass.push(newCard);
        if (i < totalCards) {
          cardCreate();
        }
        i++;
        return newCard;
      }, WAIT_TIME_MS);

    }

  }
  // функция очищения поля
  function cardsRemove() {
    let app = document.querySelector('.list');
    if (app) app.remove();
  }

  // создаем структуру игрового поля при работе с полем ввода
  let input = document.querySelector('.input');
  input.oninput = function () {
    cardsRemove(); // очищаем поле, если было введено другое значение
    createGameField('item-input'); // создаем новое поле карточек
    cardsMass = []; // сбрасываем данные масссива карточек
  };

  // функция общего ТАЙМЕРА
  function timer() {
    // функция проверки окончания таймера
    function timerCheck() {
      // если время закончилось ..
      if (sec == 0 && min == 0) {
        // .. и не была нажата ни одна карточка
        if (clickCounter == 0) {
          gameReset(); // сброс игры
          return;
          // ,, и угаданы не все карточки
        } else {
          nullTimer = 0; // чтобы "запись рекорда" понимала, что время закончилось
          definedNotAll(); // выводим результат с непольностью отгаданными картами
          return;
        }
      }
      // переход минут с 0 на 59 секунд
      if (sec == 0 && min !== 0) {
        min--;
        sec = 59;
      }
      // уменьшение таймера на 1 сек
      else sec--;
      timerNumber.textContent = timerToPage(min, sec); // отображаем результат таймера
    }
    timerCount = setInterval(timerCheck, TICK); // собственно запуск самого таймера
  }

  // функция СБРОСА игры
  function gameReset() {
    clearInterval(timerCount); // сбрасываем таймер
    min = MINUTES; // обнуляем минуты
    sec = SECONDS; // обнуляем секунды
    timerNumber.textContent = timerToPage(min, sec); // отображаем на сайте сброшенное время
    input.removeAttribute('disabled', ''); // открываем поле ввода
    startBtn.textContent = 'Начать игру'; // меняем надпись на кнопке
    startBtn.removeAttribute('id'); // убираем идентификатор кнопки сброса
    gameResult.style.zIndex = "-1"; // прячем результат
    document.querySelector('.new-record').style.zIndex = '-1'; // прячем шильдик рекорда
    document.querySelector('.blur').style.zIndex = '-1'; // убираем затемнение фона
    nullTimer = 1; // сбрасывем переменную окончания времени для "записи рекорда"
    clickCounter = 0; // сбрасываем счетчик открытых карт
    cardsRemove(); // очищаем поле от карт
    startGame(PAIR); // включаем игру заново
    cardsMass = []
  }


  // ЗАПУСКАЕМ ИГРУ
  startGame(PAIR);
  function startGame(count) {
    // при нажатии на кнопку "Начать игру"
    startBtn.onclick = function (e) {
      e.preventDefault(); // предотвращаем перезагрузку страницы
      cardsRemove(); // очищаем поле карточек оставшееся от инпута
      createGameField('item'); // создаем боевое поле карточек

      // делаем поле ввода недоступным и очищаем его
      input.value = '';
      input.setAttribute('disabled', '');

      // меняем функцию кнопки на "сбросить"
      startBtn.textContent = 'Сбросить';
      startBtn.id = 'reset';

      // если повторно нажмем кнопку, то сбросим игру
      startBtn.onclick = function (e) {
        e.preventDefault();
        if (startBtn.id) {
          gameReset();
        };
      }

      timer(); // запускаем таймер


      // НАЖАТИЕ НА КАРТУ
      function cardClick() {
        let itemToFind = document.querySelector('.list'); // находим родителя и вешаем обработчик нажатия на детей
        // при нажатии на крточку
        let elms = []; // тут будут id открытых карт

        itemToFind.onclick = function (event) {

          const target = event.target; // карта на которую нажали
          const cardIndex = [...itemToFind.childNodes].indexOf(target.parentNode); // индекс карты
          const card = cardsMass[cardIndex]

          // некоторые ограничения
          if (target.matches('.back') || target.matches('img')) return; // нажатие по открытой карте не учитываем
          if (target.matches('.list') || target.matches('.item')) return; // нажатие по родителю не учитываем
          if (elms.length >= count) return; // нельзя нажимать на новую пока не закроются старые

          card.open = true; // открываем карточку
          elms.push(target.parentNode.id) // добавляем в массив id открытой карты

          if (elms.length == count) cardClose(); // если открыто элементов больше положенного - закрываем их

          // функция закрытия карточек с таймером
          let card1 = cardsMass[elms[0] - 1];
          let card2 = cardsMass[elms[1] - 1];
          function cardClose() {
            setTimeout(() => {
              // закрываем карточки, сбрасываем массив
              card1.open = false;
              card2.open = false;
              elms = [];
            }, TICK_OPEN);
          }
          // если открыто максимальное кол-во карт за раз - проверка на совпадение и присваивание соот-ющих классов
          if (elms.length == PAIR) {
            clickCounter = elms.length + clickCounter; // прибавляем к счетчику нажатые пары
            // проверяем схожесть картинок у карточек
            if (card1.cardNumber.src !== card2.cardNumber.src) {
              cardClose();
            } else {
              // если одинаковые, фиксируем как угаданную пару
              card1.success = true;
              card2.success = true;
            }
          }
          totalDefined = document.querySelectorAll('.item-defined'); // считаем угаданные карты
          definedAll(); // запускаем итоги когда открыты все карты
        };
      }
      cardClick(); // возвращаем нажатие на кaрту
    };
  }

  // функция подсчета потраченного времени
  function recordTimeDiff(minuteToCount, secondToCount) {
    if (minuteToCount <= 0) minuteToCount = 0;
    else minuteToCount = Math.floor(secondToCount / 60);
    secondToCount = secondToCount % 60;
    return timerToPage(minuteToCount, secondToCount); // нормализуем результат
  }

  //если угаданы все карты (конец игры)
  function definedAll() {
    if (totalDefined.length == totalCards) {

      // считаем минуты и секунды
      let minTotal = MINUTES - min - 1;
      let secTotal = 60 + SECONDS - sec;

      clearInterval(timerCount); // останавливаем таймер

      // выводим результат
      gameTitle.textContent = "КРУТО!";
      gameTime.textContent = `Поле открыто за ${recordTimeDiff(minTotal, secTotal)}`;
      gameStat.textContent = `Всего найдено карт: ${totalDefined.length}\nОткрывалось карт: ${clickCounter}\n(результативность ${Math.round(totalDefined.length / clickCounter * 100)}%)`;

      recordToSet(); // проверка на рекорд
      clickCounter = 0; // сбрасываем счетчик открытых карт
      gameResult.style.height = '150px'; // увеличиваем размер окна по высоте
      gameResult.style.zIndex = "5"; // делаем видимым окно
      document.querySelector('.blur').style.zIndex = '3'; // затемняем фон
      document.querySelector('.list').style.pointerEvents = 'none'; // блочим от нажатий игрвое поле
      startBtn.textContent = 'Сыграем ещё?'; // меняем надпись на кнопке
    }
  }

  //если угаданы НЕ ВСЕ карты (конец игры)
  function definedNotAll() {
    if (totalDefined.length !== totalCards) {
      // если ниодной карты не было угадано
      if (totalDefined.length == 0) {
        gameTitle.textContent = "Да уж ...";
        gameTime.textContent = ``;
        gameStat.textContent = 'В следующий раз точно будет лучше!';
        gameResult.style.height = '115px';

        // если что-то было угадано
      } else {
        gameTitle.textContent = 'Неплохо!';
        gameTime.textContent = ``;
        gameStat.textContent = `Всего найдено карт: ${totalDefined.length}\nОткрывалось карт: ${clickCounter}\n(результативность ${Math.round(totalDefined.length / clickCounter * 100)}%)`;
        gameResult.style.height = '135px'; // уменьшаем размер окна по высоте
      }
      clearInterval(timerCount); // останавливаем таймер
      recordToSet(); // проверка на рекорд
      clickCounter = 0; // сбрасываем счетчик открытых карт
      gameResult.style.zIndex = "5"; // делаем видимым окно
      document.querySelector('.blur').style.zIndex = '3'; // затемняем фон
      document.querySelector('.list').style.pointerEvents = 'none'; // блочим от нажатий игрвое поле
      startBtn.textContent = 'Сыграем ещё?'; // меняем надпись на кнопке
    }
  }

  // ЛОГИКА записи и отображение рекорда
  function recordToSet() {
    let minTotal = MINUTES - min - 1;
    let secTotal = 60 + SECONDS - sec;
    let minLocal;
    let secLocal;

    // сокращаем код
    let recordToDisplay = () => {
      recordWrite();
      document.querySelector('.new-record').style.zIndex = '10';
    }

    // если угаданы все карты
    if (totalDefined.length == totalCards) {
      if (getData(inputNum / 2 - 1, 'time') !== 0) {
        minLocal = Number(getData(inputNum / 2 - 1, 'time').split(':')[0]) * 60; // вытаскиваем минуты, преобразуем минуты в секунды
        secLocal = Number(getData(inputNum / 2 - 1, 'time').split(':')[1]); // вытаскиваем секунды
      } else { // если время ниразу не записывалось
        minLocal = minTotal + 1;
        secLocal = secTotal + 1;
      }
      let summLocal = minLocal + secLocal;
      let minGame = Number(recordTimeDiff(minTotal, secTotal).split(':')[0]) * 60;
      let secGame = Number(recordTimeDiff(minTotal, secTotal).split(':')[1]);
      let summGame = minGame + secGame

      // сравниваем время с рекордом, если тек.результат лучше, то записываем и объявляем
      if (summLocal > summGame) recordToDisplay();
      else if (summLocal == summGame) {
        // если время одинаковое, то дальше сравниваем по эффективности
        if (getData(inputNum / 2 - 1, 'effective') < Math.round(totalDefined.length / clickCounter * 100)) recordToDisplay();
      }
    }

    // если угаданы НЕ все карты
    if (totalDefined.length !== totalCards) {
      if (getData(inputNum / 2 - 1, 'time') == 0) {
        if (getData(inputNum / 2 - 1, 'defined') < totalDefined.length) recordToDisplay(); // если угадано больше рекорда, то записываем
        // если угадано столько же сколько и в рекорде ..
        if (getData(inputNum / 2 - 1, 'defined') == totalDefined.length) {
          // ..то сравниваем по эффективности
          if (getData(inputNum / 2 - 1, 'effective') < Math.round(totalDefined.length / clickCounter * 100)) recordToDisplay();
        }

      }
    }
    // запись рекорда. таблица уровней(2-0 4-1 6-2 8-3 10-4)
    function recordWrite() {
      if (nullTimer !== 0) setData(inputNum / 2 - 1, 'time', recordTimeDiff(minTotal, secTotal)); // проверка на окончание времени
      setData(inputNum / 2 - 1, 'defined', totalDefined.length);
      setData(inputNum / 2 - 1, 'opened', clickCounter);
      setData(inputNum / 2 - 1, 'effective', Math.round(totalDefined.length / clickCounter * 100));
    }
  }
});
