// Cart module
export function renderCartList(cart: any[], cartList: HTMLElement) {
  cartList.innerHTML = '';
  if (!cart || cart.length === 0) {
    cartList.innerHTML = '<p>Twój koszyk jest pusty.</p>';
    return;
  }
  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `<strong>${item.name}</strong> x ${item.qty} = ${item.price * item.qty} zł`;
    cartList.appendChild(div);
  });
}

export function showCartError(message: string, container: HTMLElement) {
  container.innerHTML = `<div class="cart-error">${message}</div>`;
}