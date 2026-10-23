/** "KSh 14,500" — prices on the cart, checkout and buy box. */
export const formatKsh = (amount, currency = 'KES') => `${currency === 'KES' ? 'KSh' : currency} ${Number(amount || 0).toLocaleString('en-KE')}`;
