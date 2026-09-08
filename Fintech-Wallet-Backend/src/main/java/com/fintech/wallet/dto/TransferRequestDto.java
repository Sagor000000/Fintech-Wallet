package com.fintech.wallet.dto;

import com.fintech.wallet.enums.TransactionCategory;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransferRequestDto {
    private Long senderWalletId;
    private Long receiverWalletId;
    private BigDecimal amount;
    private TransactionCategory category;
    private String pin;
}