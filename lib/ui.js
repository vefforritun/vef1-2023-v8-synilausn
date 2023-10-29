import { emptyElement, formatPrice } from './helpers.js';

/**
 * Eyða línu úr körfu.
 * @param {SubmitEvent} e
 */
function removeCartLineHandler(e) {
  e.preventDefault();

  if (!e.submitter) {
    console.warn('fann ekki submitter');
    return;
  }

  // Fjarlægjum línu úr körfu
  const cartLine = e.submitter.closest('tr');
  if (cartLine) {
    cartLine.remove();
  }

  const cartTable = document.querySelector('.cart-table');
  if (!cartTable) {
    console.warn('fann ekki cart table');
    return;
  }

  const cartTableLineElements = cartTable.querySelectorAll('tbody tr');

  // Ef þetta var seinasta línan, „eyða allri körfu“ (vitum að það er ekkert
  // annað í körfu) og sýnum tóma körfu
  if (cartTableLineElements.length === 0) {
    emptyCart();
    // Annars uppfærum við samtölu
  } else {
    updateCartTotal(cartTable);
  }
}

/**
 * Búa til form til að fjarlægja línu úr körfu.
 * @returns {HTMLFormElement}
 */
function createCartLineRemove() {
  const cartLineRemoveForm = document.createElement('form');
  cartLineRemoveForm.classList.add('remove');
  cartLineRemoveForm.method = 'post';
  cartLineRemoveForm.addEventListener('submit', removeCartLineHandler);

  const cartLineRemoveButtonElement = document.createElement('button');
  cartLineRemoveButtonElement.textContent = 'Eyða';

  cartLineRemoveForm.appendChild(cartLineRemoveButtonElement);

  return cartLineRemoveForm;
}

/**
 * Eyða öllu úr körfu og birta tóma körfu.
 */
export function emptyCart() {
  const cartTableElement = document.querySelector('.cart-table');
  if (!cartTableElement) {
    console.warn('fann ekki cart table');
    return;
  }

  const cartTableBodyElement = cartTableElement.querySelector('tbody');

  if (!cartTableBodyElement) {
    console.warn('fann ekki cart table body');
    return;
  }

  emptyElement(cartTableBodyElement);
  updateCartTotal(cartTableElement);
  showCartContent(false);
}

/**
 * Uppfæra línu í körfu.
 * @param {HTMLTableRowElement | null} cartLine
 * @param {import('../main.js').Product} product
 * @param {number} quantity
 */
export function updateCartLine(cartLine, product, quantity) {
  if (!cartLine) {
    return;
  }

  const quantityElement = cartLine.querySelector('.quantity');
  const totalElement = cartLine.querySelector('.total');

  if (!quantityElement || !totalElement) {
    console.warn('fann ekki quantity eða total');
    return;
  }

  const currentQuantity = Number.parseInt(
    quantityElement.textContent ?? '1',
    10,
  );
  const newQuantity = currentQuantity + quantity;
  cartLine.dataset.quantity = newQuantity.toString();
  quantityElement.textContent = newQuantity.toString();

  const newTotal = newQuantity * product.price;
  totalElement.textContent = formatPrice(newTotal);
}

/**
 * Búa til línu í körfu.
 * @param {import('../main.js').Product} product
 * @param {number} quantity
 */
export function createCartLine(product, quantity) {
  const cartLineElement = document.createElement('tr');

  // Setjum upplýsingar um vöru sem data-attribute, það er auðveldara að nálgast
  // þar í staðinn fyrir að taka úr `textContent` og lesa úr formuðum texta.
  cartLineElement.dataset.cartProductId = product.id.toString();
  cartLineElement.dataset.price = product.price.toString();
  cartLineElement.dataset.quantity = quantity.toString();

  const cartLineTitleElement = document.createElement('td');
  cartLineTitleElement.classList.add('title');
  cartLineTitleElement.textContent = product.title;

  const cartLineQuantityElement = document.createElement('td');
  cartLineQuantityElement.classList.add('quantity');
  cartLineQuantityElement.textContent = quantity.toString();

  const cartLinePriceElement = document.createElement('td');
  cartLinePriceElement.classList.add('price');
  cartLinePriceElement.textContent = formatPrice(product.price);

  const cartLineTotalElement = document.createElement('td');
  cartLineTotalElement.classList.add('total');
  cartLineTotalElement.textContent = formatPrice(product.price * quantity);

  const cartLineRemoveElement = document.createElement('td');
  cartLineRemoveElement.appendChild(createCartLineRemove());

  cartLineElement.appendChild(cartLineTitleElement);
  cartLineElement.appendChild(cartLineQuantityElement);
  cartLineElement.appendChild(cartLinePriceElement);
  cartLineElement.appendChild(cartLineTotalElement);
  cartLineElement.appendChild(cartLineRemoveElement);

  return cartLineElement;
}

/**
 * Uppfæra heildarverð körfu.
 * @param {Element|null} cartElement
 */
export function updateCartTotal(cartElement) {
  if (!cartElement) {
    console.warn('fékk ekki cart');
    return;
  }

  const cartTotalElement = cartElement.querySelector('tfoot .price');
  if (!cartTotalElement) {
    console.warn('fann ekki cart samtölu');
    return;
  }

  // Tilgreinum *hvernig* element við fáum svo getum nálgast `dataset` án þess
  // að vscode "js check" skili villu
  /** @type {NodeListOf<HTMLTableRowElement>} */
  const cartLines = cartElement.querySelectorAll('tbody tr');
  if (!cartLines) {
    console.warn('fann ekki cart lines');
    return;
  }

  let total = 0;
  for (const cartLine of Array.from(cartLines)) {
    const price = Number.parseInt(cartLine.dataset.price ?? '0', 10);
    const quantity = Number.parseInt(cartLine.dataset.quantity ?? '0', 10);
    const cartLineTotalElement = cartLine.querySelector('.total');
    total += price * quantity;

    if (!cartLineTotalElement) {
      console.warn('fann ekki cart line total');
      continue;
    }
    cartLineTotalElement.textContent = formatPrice(price * quantity);
  }

  cartTotalElement.textContent = formatPrice(total);
}

/**
 * Sýna efni körfu eða ekki.
 * @param {boolean} show Sýna körfu eða ekki
 */
export function showCartContent(show = true) {
  // Finnum element sem innihalda körfu
  const cartEmptyElement = document.querySelector('.cart-empty');
  const cartTableElement = document.querySelector('.cart-table');
  const cartFormElement = document.querySelector('.cart-form');

  if (!cartEmptyElement || !cartTableElement || !cartFormElement) {
    console.warn('fann ekki cart element');
    return;
  }

  if (show) {
    cartEmptyElement.classList.add('hidden');
    cartTableElement.classList.remove('hidden');
    cartFormElement.classList.remove('hidden');
  } else {
    cartEmptyElement.classList.remove('hidden');
    cartTableElement.classList.add('hidden');
    cartFormElement.classList.add('hidden');
  }
}

/**
 * Sýna körfu eða kvittun.
 * @param {boolean} showCart Sýna körfu? Sýnir annars kvittun.
 */
export function showCartOrReceipt(showCart = true) {
  const cartElement = document.querySelector('.cart');
  const receiptElement = document.querySelector('.receipt');

  if (!cartElement || !receiptElement) {
    console.warn('fann ekki körfu eða kvittun');
    return;
  }

  if (showCart) {
    cartElement.classList.remove('hidden');
    receiptElement.classList.add('hidden');
  } else {
    cartElement.classList.add('hidden');
    receiptElement.classList.remove('hidden');
  }
}
