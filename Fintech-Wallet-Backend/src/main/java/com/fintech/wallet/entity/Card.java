package com.fintech.wallet.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fintech.wallet.enums.CardType;

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

    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardType cardType;

    
    @Column(nullable = false, length = 4)
    private String lastFourDigits;

    
    @Column(nullable = false)
    private String expiryDate;
}