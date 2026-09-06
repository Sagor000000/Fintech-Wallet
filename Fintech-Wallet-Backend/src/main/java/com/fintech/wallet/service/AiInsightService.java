package com.fintech.wallet.service;

import com.fintech.wallet.entity.Transaction;
import com.fintech.wallet.repository.TransactionRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiInsightService {

    private final TransactionRepository transactionRepository;
    private final ChatClient chatClient;

    public AiInsightService(TransactionRepository transactionRepository, ChatClient.Builder chatClientBuilder) {
        this.transactionRepository = transactionRepository;
        this.chatClient = chatClientBuilder.build();
    }

    public String generateFinancialAdvice(Long walletId) {
        // Pageable
        Pageable pageable = PageRequest.of(0, 10);
        List<Transaction> history = transactionRepository.findBySenderWalletIdOrReceiverWalletIdOrderByTimestampDesc(walletId, walletId, pageable).getContent();

        if (history.isEmpty()) {
            return "No transactions found to generate insights.";
        }

        String transactionData = history.stream()
                .map(tx -> "Category: " + tx.getCategory() + ", Amount: BDT " + tx.getAmount() + ", Type: " +
                        (tx.getSenderWallet().getId().equals(walletId) ? "Debit" : "Credit"))
                .collect(Collectors.joining("\n"));

        String prompt = "You are a smart financial advisor. Based on these recent transactions of a Bangladeshi user, provide a brief, professional 3-sentence financial advice focusing on their spending habits and how they can save money:\n"
                + transactionData;

        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }
}