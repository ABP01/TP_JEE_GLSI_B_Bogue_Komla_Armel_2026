package com.ega.egabank.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO pour les statistiques du dashboard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private long totalClients;
    private long totalAccounts;
    private long activeAccounts;
    private BigDecimal totalBalance;
    private long totalTransactions;
}
