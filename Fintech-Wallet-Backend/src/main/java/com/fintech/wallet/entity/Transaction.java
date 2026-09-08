package com.fintech.wallet.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fintech.wallet.enums.TransactionCategory;
import com.fintech.wallet.enums.TransactionStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    @ManyToOne
    @JoinColumn(name = "sender_wallet_id", nullable = false)
    private Wallet senderWallet;

    @ManyToOne
    @JoinColumn(name = "receiver_wallet_id", nullable = false)
    private Wallet receiverWallet;
    
    @Column(nullable = false)
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    @Enumerated(EnumType.STRING)
    @Column
    private TransactionCategory category;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "otp_code")
    private String otp;

    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;
}