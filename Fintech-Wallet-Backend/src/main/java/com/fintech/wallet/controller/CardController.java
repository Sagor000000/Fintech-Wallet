package com.fintech.wallet.controller;

import com.fintech.wallet.entity.Card;
import com.fintech.wallet.service.CardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    
    @PostMapping("/add")
    public ResponseEntity<Card> addCard(
            @RequestParam Long userId,
            @RequestParam String cardType,
            @RequestParam String fullCardNumber,
            @RequestParam String expiryDate) {

        
        if (fullCardNumber == null || fullCardNumber.length() < 16) {
            throw new RuntimeException("Invalid Card Number! Must be at least 16 digits.");
        }

        Card savedCard = cardService.addCard(userId, cardType, fullCardNumber, expiryDate);
        return ResponseEntity.ok(savedCard);
    }

    
    @DeleteMapping("/{cardId}")
    public ResponseEntity<String> deleteCard(@PathVariable Long cardId) {
        String response = cardService.deleteCard(cardId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Card>> getUserCards(@PathVariable Long userId) {
        return ResponseEntity.ok(cardService.getUserCards(userId));
    }
}