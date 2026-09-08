package com.fintech.wallet.dto;

import com.fintech.wallet.enums.CardType;
import lombok.Data;

@Data
public class CardAddRequestDto {
    private Long userId;
    private CardType cardType;
    private String fullCardNumber;
    private String expiryDate;

}