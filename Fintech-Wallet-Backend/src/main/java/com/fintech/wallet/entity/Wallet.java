package com.fintech.wallet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    @Column(nullable = false)
    private BigDecimal currentBalance = BigDecimal.ZERO;

    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}