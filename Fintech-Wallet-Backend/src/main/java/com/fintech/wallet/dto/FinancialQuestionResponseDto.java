package com.fintech.wallet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinancialQuestionResponseDto {
    private boolean success;
    private String answer;
    private String message;
}
