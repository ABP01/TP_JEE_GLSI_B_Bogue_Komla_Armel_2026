package com.ega.egabank.controller;

import com.ega.egabank.dto.response.DashboardStatsResponse;
import com.ega.egabank.repository.AccountRepository;
import com.ega.egabank.repository.ClientRepository;
import com.ega.egabank.repository.TransactionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

/**
 * Contrôleur pour les statistiques du dashboard
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Statistiques du dashboard")
public class DashboardController {

    private final ClientRepository clientRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @Operation(summary = "Récupérer les statistiques du dashboard")
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        long totalClients = clientRepository.count();
        long totalAccounts = accountRepository.count();
        long activeAccounts = accountRepository.countByActifTrue();
        BigDecimal totalBalance = accountRepository.sumAllBalances();
        long totalTransactions = transactionRepository.count();

        DashboardStatsResponse stats = DashboardStatsResponse.builder()
                .totalClients(totalClients)
                .totalAccounts(totalAccounts)
                .activeAccounts(activeAccounts)
                .totalBalance(totalBalance != null ? totalBalance : BigDecimal.ZERO)
                .totalTransactions(totalTransactions)
                .build();

        return ResponseEntity.ok(stats);
    }
}
