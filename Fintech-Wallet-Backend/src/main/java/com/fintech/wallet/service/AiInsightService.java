package com.fintech.wallet.service;

import com.fintech.wallet.dto.FinancialQuestionResponseDto;

public interface AiInsightService {
    String generateFinancialAdvice(Long walletId);
    FinancialQuestionResponseDto answerFinancialQuestion(Long walletId, String question);
}
