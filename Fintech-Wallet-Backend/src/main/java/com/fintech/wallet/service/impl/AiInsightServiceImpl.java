package com.fintech.wallet.service.impl;

import com.fintech.wallet.entity.Transaction;
import com.fintech.wallet.repository.TransactionRepository;

import com.fintech.wallet.service.AiInsightService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.stream.Collectors;

import com.fintech.wallet.dto.FinancialQuestionResponseDto;

@Service
public class AiInsightServiceImpl implements AiInsightService {

    private final TransactionRepository transactionRepository;
    private final ChatClient chatClient;
    private final String apiKey;

    public AiInsightServiceImpl(
            TransactionRepository transactionRepository,
            ChatClient.Builder chatClientBuilder,
            @Value("${spring.ai.openai.api-key:}") String apiKey) {
        this.transactionRepository = transactionRepository;
        this.chatClient = chatClientBuilder.build();
        this.apiKey = apiKey;
    }

    private boolean isAiConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    private String buildTransactionContext(Long walletId, int pageSize) {
        Pageable pageable = PageRequest.of(0, pageSize);
        List<Transaction> history = transactionRepository
                .findBySenderWalletIdOrReceiverWalletIdOrderByTimestampDesc(walletId, walletId, pageable)
                .getContent();

        if (history.isEmpty()) {
            return "No transactions found.";
        }

        return history.stream()
                .map(tx -> "Category: " + tx.getCategory() + ", Amount: BDT " + tx.getAmount() + ", Type: " +
                        (tx.getSenderWallet().getId().equals(walletId) ? "Debit" : "Credit"))
                .collect(Collectors.joining("\n"));
    }

    public String generateFinancialAdvice(Long walletId) {
        if (!isAiConfigured()) {
            return "AI insights are temporarily unavailable because the AI service is not configured.";
        }

        String transactionData = buildTransactionContext(walletId, 10);

        if ("No transactions found.".equals(transactionData)) {
            return "No transactions found to generate insights.";
        }

        String prompt = "You are a smart financial advisor. Based on these recent transactions of a Bangladeshi user, provide a brief, professional 3-sentence financial advice focusing on their spending habits and how they can save money:\n"
                + transactionData;

        try {
            return chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception exception) {
            return "AI insights are temporarily unavailable. Please try again later.";
        }
    }

    public FinancialQuestionResponseDto answerFinancialQuestion(Long walletId, String question) {
        if (question == null || question.trim().isEmpty()) {
            return new FinancialQuestionResponseDto(false, null, "Question cannot be empty.");
        }

        if (!isAiConfigured()) {
            return new FinancialQuestionResponseDto(
                    false,
                    null,
                    "AI chat is temporarily unavailable because the AI service is not configured."
            );
        }

        String transactionData = buildTransactionContext(walletId, 10);

        String prompt = "You are a helpful financial assistant for a Bangladeshi wallet app. Answer the user's question clearly and briefly using the wallet transaction history below. If the question asks for spending, savings, budgeting, or transaction patterns, ground the answer in the recent transactions. If the history is insufficient, say so politely. Keep the answer to 3-5 sentences.\n\n"
                + "Question: " + question.trim() + "\n\n"
                + "Transaction history:\n"
                + transactionData;

        try {
            String answer = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            return new FinancialQuestionResponseDto(true, answer, "");
        } catch (Exception exception) {
            return new FinancialQuestionResponseDto(
                    false,
                    null,
                    "AI chat is temporarily unavailable. Please try again later."
            );
        }
    }
}