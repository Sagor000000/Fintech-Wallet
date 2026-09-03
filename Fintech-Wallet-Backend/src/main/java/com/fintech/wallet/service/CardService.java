package com.fintech.wallet.service;

import com.fintech.wallet.entity.Card;
import com.fintech.wallet.entity.User;
import com.fintech.wallet.repository.CardRepository;
import com.fintech.wallet.repository.UserRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    
    public Card addCard(Long userId, String cardType, String fullCardNumber, String expiryDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        
        String lastFour = fullCardNumber.substring(fullCardNumber.length() - 4);

        Card card = new Card();
        card.setUser(user);
        card.setCardType(cardType);
        card.setLastFourDigits(lastFour);
        card.setExpiryDate(expiryDate);

        return cardRepository.save(card);
    }

    
    public String deleteCard(Long cardId) {
        
        if (!cardRepository.existsById(cardId)) {
            throw new RuntimeException("Card not found!");
        }

        
        cardRepository.deleteById(cardId);
        return "Card deleted successfully!";
    }

    
    public List<Card> getUserCards(Long userId) {
        return cardRepository.findByUserId(userId);
    }
}