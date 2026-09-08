export type Card = {
  id: number;
  cardType: string;
  lastFourDigits: string;
  expiryDate: string;
};

export type AddCardRequest = {
  userId: number;
  cardType: string;
  fullCardNumber: string;
  expiryDate: string;
};
