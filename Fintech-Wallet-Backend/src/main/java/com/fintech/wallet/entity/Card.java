package com.fintech.wallet.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    
    @Column(nullable = false)
    private String cardType;

    
    @Column(nullable = false, length = 4)
    private String lastFourDigits;

    
    @Column(nullable = false)
    private String expiryDate;
}