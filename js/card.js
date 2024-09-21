export class Card {
  constructor(container, cardNumber, classAdd, flip, index) {
    this.container = container;
    this.cardNumber = cardNumber;
    this.classAdd = classAdd;
    this.flip = flip;
    this.index = index;
    this._open = open;
    this.createElement();
  }

  createElement() {
    let card = document.createElement('li');
    let cardFront = document.createElement('div');
    let cardBack = document.createElement('div');
    let container = document.querySelector(this.container);
    card.classList.add(this.classAdd);
    card.setAttribute('id', this.index);
    cardFront.classList.add('front');
    cardBack.classList.add('back');
    container.append(card);
    card.append(cardFront);
    card.append(cardBack);

    card.addEventListener('click', () => {
      this.flip(this);
    })
  }

  openElement() {
    const itemToFind = document.querySelector('.list');
    const target = [...itemToFind.childNodes][this.index - 1];
    const back = target.querySelector('.back');
    target.classList.add('item-opened');
    target.style.transform = 'rotateY(180deg)';
    back.append(this._cardNumber);
  }

  closeElement() {
    if (this._success == false) {
      const itemToFind = document.querySelector('.list');
      const target = [...itemToFind.childNodes][this.index - 1];
      target.classList.remove('item-opened');
      target.style.transform = 'rotateY(0deg)';
    }
  }

  defineElement() {
    const itemToFind = document.querySelector('.list');
    const target = [...itemToFind.childNodes][this.index - 1];
    const back = target.querySelector('.back');
    target.classList.remove('item-opened');
    target.classList.add('item-defined');
    back.append(this._cardNumber);
  }

  set cardNumber(value) {
    this._cardNumber = value;
  }
  get cardNumber() {
    return this._cardNumber;
  }

  set open(value) {
    if (value == true) this.openElement();
    if (value == false) this.closeElement();
    this._open = value;
  }
  get open() {
    return this._open;
  }

  set success(value) {
    if (value == true) this.defineElement();
    if (value == false) this.closeElement();
    this._success = value;
  }
  get success() {
    return this._success;
  }
}

export class AmazingCard extends Card {
  set cardNumber(value) {
    let cardsImgArray = [];
    for (let i = 0; i <= 50; i++) {
      if (i < 10) cardsImgArray.push(`/img/cards/animal_0${i}.png`);
      else cardsImgArray.push(`/img/cards/animal_${i}.png`);
    }
    const img = document.createElement('img');
    img.src = cardsImgArray[value];
    img.onerror = function () {
      img.src = '/img/nofoto.png';
    }
    this._cardNumber = img;
  }
  get cardNumber() {
    return this._cardNumber;
  }
}
