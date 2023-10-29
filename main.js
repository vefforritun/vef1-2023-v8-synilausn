import { validateInteger } from './lib/helpers.js';
import {
  createCartLine,
  emptyCart,
  showCartContent,
  showCartOrReceipt,
  updateCartLine,
  updateCartTotal,
} from './lib/ui.js';

/**
 * @typedef {Object} Product
 * @property {number} id Auðkenni vöru, jákvæð heiltala stærri en 0.
 * @property {string} title Titill vöru, ekki tómur strengur.
 * @property {string} description Lýsing á vöru, ekki tómur strengur.
 * @property {number} price Verð á vöru, jákvæð heiltala stærri en 0.
 */

/**
 * Fylki af vörum sem hægt er að kaupa.
 * @type {Array<Product>}
 */
const products = [
  {
    id: 1,
    title: 'HTML húfa',
    description:
      'Húfa sem heldur hausnum heitum og hvíslar hugsanlega að þér hvaða element væri best að nota.',
    price: 5_000,
  },
  {
    id: 2,
    title: 'CSS sokkar',
    description: 'Sokkar sem skalast vel með hvaða fótum sem er.',
    price: 3_000,
  },
  {
    id: 3,
    title: 'JavaScript jakki',
    description: 'Mjög töff jakki fyrir öll sem skrifa JavaScript reglulega.',
    price: 20_000,
  },
];

/**
 * Bæta vöru í körfu.
 * @param {Product} product Vara sem á að bæta í körfu
 * @param {number} quantity Fjöldi af vöru sem á að bæta í körfu
 */
function addProductToCart(product, quantity) {
  const cartTable = document.querySelector('.cart-table');
  const cartTableBody = document.querySelector('.cart-table tbody');

  if (!cartTableBody) {
    console.warn('fann ekki körfu töflu');
    return;
  }

  // Tilgreinum *hvernig* element við fáum svo getum nálgast `dataset` án þess
  // að vscode "js check" skili villu
  /** @type {HTMLTableRowElement | null} */
  const cartLine = cartTableBody.querySelector(
    `tr[data-cart-product-id="${product.id}"]`,
  );

  // Er varan nú þegar í körfu?
  if (cartLine) {
    updateCartLine(cartLine, product, quantity);
  } else {
    const newCartLine = createCartLine(product, quantity);
    cartTableBody.appendChild(newCartLine);
  }

  updateCartTotal(cartTable);
  showCartContent(true);
}

/**
 * Bæta vöru í körfu.
 * @param {SubmitEvent} event
 * @returns
 */
function addToCartSubmitHandler(event) {
  event.preventDefault();

  if (!event.submitter) {
    console.warn('fann ekki submitter');
    return;
  }

  const parent = event.submitter.closest('tr');

  if (!parent) {
    console.warn('fann ekki tr fyrir form');
    return;
  }

  const productId = Number.parseInt(parent.dataset.productId ?? '');
  const product = products.find((i) => i.id === productId);

  if (!product) {
    console.warn('fann ekki vöru', productId);
    return;
  }

  /** @type {HTMLInputElement | null} */
  const quantityInputElement = parent.querySelector(
    'input[name="quantity"]',
  );
  if (!quantityInputElement) {
    console.warn('gat ekki fundið fjölda input');
    return;
  }

  const quantity = Number.parseInt(quantityInputElement.value ?? '', 10);
  if (!validateInteger(quantity, 1, 99)) {
    console.warn('fjöldi ekki á bilinu [1, 99]');
    return;
  }

  addProductToCart(product, quantity);
}

// Finnum öll form til að bæta við í körfu og bætum við event handlerum

/** @type {NodeListOf<HTMLFormElement>} */
const addToCartForms = document.querySelectorAll('form.add');

for (const form of Array.from(addToCartForms)) {
  form.addEventListener('submit', addToCartSubmitHandler);
}

// Bætum event handler við „Ganga frá kaupum“ form
const form = document.querySelector('form.cart-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    emptyCart();
    showCartOrReceipt(false);
  });
} else {
  console.error('fann ekki körfu form');
}

// Bætum við event handler við „Kaupa meira“ hlekk
const shopMoreLink = document.querySelector('.shop-more');
if (shopMoreLink) {
  shopMoreLink.addEventListener('click', (e) => {
    e.preventDefault();
    showCartOrReceipt(true);
  });
}
