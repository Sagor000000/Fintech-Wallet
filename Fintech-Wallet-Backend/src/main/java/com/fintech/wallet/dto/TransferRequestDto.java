package com.fintech.wallet.dto;

import java.math.BigDecimal;

public class TransferRequestDto {
    private Long senderWalletId;
    private Long receiverWalletId;
    private BigDecimal amount;
    private String category;
    private String pin;

    // Getters
    public Long getSenderWalletId() { return senderWalletId; }
    public Long getReceiverWalletId() { return receiverWalletId; }
    public BigDecimal getAmount() { return amount; }
    public String getCategory() { return category; }
    public String getPin() { return pin; }

    // Setters
    public void setSenderWalletId(Long senderWalletId) { this.senderWalletId = senderWalletId; }
    public void setReceiverWalletId(Long receiverWalletId) { this.receiverWalletId = receiverWalletId; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setCategory(String category) { this.category = category; }
    public void setPin(String pin) { this.pin = pin; }
}