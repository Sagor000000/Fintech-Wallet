package com.fintech.wallet.service;

import com.fintech.wallet.entity.Card;
import com.fintech.wallet.enums.CardType;

import java.util.List;

public interface CardService {
    Card addCard(Long userId, CardType cardType, String fullCardNumber, String expiryDate);
    String deleteCard(Long cardId);
    List<Card> getUserCards(Long userId);
}
