package com.fintech.wallet.dto;
import lombok.Data;

@Data
public class CardAddRequestDto {
    private Long userId;
    private String cardType;
    private String fullCardNumber;
    private String expiryDate;

}