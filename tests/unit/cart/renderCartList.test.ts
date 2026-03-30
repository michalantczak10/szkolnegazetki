import { renderCartList } from '../../../client/modules/cart';

describe('renderCartList', () => {
  it('should render empty message when cart is empty', () => {
    const cart: any[] = [];
    const cartList = document.createElement('div');
    renderCartList(cart, cartList);
    expect(cartList.innerHTML).toContain('Twój koszyk jest pusty');
  });

  it('should render cart items', () => {
    const cart = [
      { name: 'Galaretka', qty: 2, price: 10 },
      { name: 'Salceson', qty: 1, price: 15 }
    ];
    const cartList = document.createElement('div');
    renderCartList(cart, cartList);
    expect(cartList.innerHTML).toContain('Galaretka');
    expect(cartList.innerHTML).toContain('Salceson');
    expect(cartList.innerHTML).toContain('20 zł');
    expect(cartList.innerHTML).toContain('15 zł');
  });
});
