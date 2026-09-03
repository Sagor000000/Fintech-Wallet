package com.fintech.wallet.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransferRequestDto {
    private Long senderWalletId;
    private Long receiverWalletId;
    private BigDecimal amount;
    private String category;
    private String pin;
}