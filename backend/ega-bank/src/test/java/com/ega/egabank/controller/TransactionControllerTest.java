package com.ega.egabank.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.ega.egabank.dto.request.OperationRequest;
import com.ega.egabank.dto.request.TransferRequest;
import com.ega.egabank.dto.response.TransactionResponse;
import com.ega.egabank.enums.TypeTransaction;
import com.ega.egabank.exception.InsufficientBalanceException;
import com.ega.egabank.exception.OperationNotAllowedException;
import com.ega.egabank.exception.ResourceNotFoundException;
import com.ega.egabank.security.JwtTokenProvider;
import com.ega.egabank.service.TransactionService;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Tests d'intégration pour TransactionController
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Tests du contrôleur Transaction")
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransactionService transactionService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    private ObjectMapper objectMapper;
    private OperationRequest operationRequest;
    private TransferRequest transferRequest;
    private TransactionResponse transactionResponse;

    private static final String SOURCE_IBAN = "TG53TG0000000000000000012345678";
    private static final String DEST_IBAN = "TG53TG0000000000000000087654321";

        @BeforeEach
        void setUp() throws Exception {
        objectMapper = new ObjectMapper();

        operationRequest = OperationRequest.builder()
                .montant(new BigDecimal("200.00"))
                .description("Opération test")
                .build();

        transferRequest = TransferRequest.builder()
                .compteSource(SOURCE_IBAN)
                .compteDestination(DEST_IBAN)
                .montant(new BigDecimal("300.00"))
                .description("Virement test")
                .build();

        transactionResponse = TransactionResponse.builder()
                .id(1L)
                .type(TypeTransaction.DEPOT)
                .typeLibelle("Dépôt")
                .montant(new BigDecimal("200.00"))
                .numeroCompte(SOURCE_IBAN)
                .soldeAvant(new BigDecimal("1000.00"))
                .soldeApres(new BigDecimal("1200.00"))
                .build();
    }

    @Nested
    @DisplayName("POST /api/transactions/{numeroCompte}/deposit")
    class DepositTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait effectuer un dépôt avec succès")
        void shouldDepositSuccessfully() throws Exception {
            // Arrange
            when(transactionService.deposit(SOURCE_IBAN, operationRequest)).thenReturn(transactionResponse);

            // Act & Assert
            mockMvc.perform(post("/api/transactions/{numeroCompte}/deposit", SOURCE_IBAN)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(operationRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.type").value("DEPOT"))
                    .andExpect(jsonPath("$.montant").value(200.00));
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 404 si le compte n'existe pas")
        void shouldReturn404IfAccountNotFound() throws Exception {
            // Arrange
            when(transactionService.deposit(eq("INVALID"), any(OperationRequest.class)))
                    .thenThrow(new ResourceNotFoundException("Compte", "numéro", "INVALID"));

            // Act & Assert
            mockMvc.perform(post("/api/transactions/{numeroCompte}/deposit", "INVALID")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(operationRequest)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 400 si le montant est invalide")
        void shouldReturn400IfInvalidAmount() throws Exception {
            // Arrange
            OperationRequest invalidRequest = OperationRequest.builder()
                    .montant(new BigDecimal("-100.00")) // Montant négatif
                    .build();

            // Act & Assert
            mockMvc.perform(post("/api/transactions/{numeroCompte}/deposit", SOURCE_IBAN)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/transactions/{numeroCompte}/withdraw")
    class WithdrawTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait effectuer un retrait avec succès")
        void shouldWithdrawSuccessfully() throws Exception {
            // Arrange
            TransactionResponse withdrawResponse = TransactionResponse.builder()
                    .id(1L)
                    .type(TypeTransaction.RETRAIT)
                    .montant(new BigDecimal("200.00"))
                    .build();
            when(transactionService.withdraw(SOURCE_IBAN, operationRequest)).thenReturn(withdrawResponse);

            // Act & Assert
            mockMvc.perform(post("/api/transactions/{numeroCompte}/withdraw", SOURCE_IBAN)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(operationRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.type").value("RETRAIT"));
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 400 si le solde est insuffisant")
        void shouldReturn400IfInsufficientBalance() throws Exception {
            // Arrange
            when(transactionService.withdraw(eq(SOURCE_IBAN), any(OperationRequest.class)))
                    .thenThrow(new InsufficientBalanceException(SOURCE_IBAN,
                            new BigDecimal("100.00"), new BigDecimal("500.00")));

            // Act & Assert
            mockMvc.perform(post("/api/transactions/{numeroCompte}/withdraw", SOURCE_IBAN)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(operationRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 400 si le compte est inactif")
        void shouldReturn400IfAccountInactive() throws Exception {
            // Arrange
            when(transactionService.withdraw(eq(SOURCE_IBAN), any(OperationRequest.class)))
                    .thenThrow(new OperationNotAllowedException("Le compte est inactif"));

            // Act & Assert
            mockMvc.perform(post("/api/transactions/{numeroCompte}/withdraw", SOURCE_IBAN)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(operationRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/transactions/transfer")
    class TransferTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait effectuer un virement avec succès")
        void shouldTransferSuccessfully() throws Exception {
            // Arrange
            TransactionResponse transferResponse = TransactionResponse.builder()
                    .id(1L)
                    .type(TypeTransaction.VIREMENT_SORTANT)
                    .montant(new BigDecimal("300.00"))
                    .compteDestination(DEST_IBAN)
                    .build();
            when(transactionService.transfer(any(TransferRequest.class))).thenReturn(transferResponse);

            // Act & Assert
            mockMvc.perform(post("/api/transactions/transfer")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(transferRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.type").value("VIREMENT_SORTANT"))
                    .andExpect(jsonPath("$.montant").value(300.00));
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 400 si source et destination sont identiques")
        void shouldReturn400IfSameAccount() throws Exception {
            // Arrange
            transferRequest.setCompteDestination(SOURCE_IBAN);
            when(transactionService.transfer(any(TransferRequest.class)))
                    .thenThrow(new OperationNotAllowedException("Source et destination identiques"));

            // Act & Assert
            mockMvc.perform(post("/api/transactions/transfer")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(transferRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 400 si les données sont manquantes")
        void shouldReturn400IfMissingData() throws Exception {
            // Arrange
            TransferRequest invalidRequest = new TransferRequest();

            // Act & Assert
            mockMvc.perform(post("/api/transactions/transfer")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/transactions/{numeroCompte}/history")
    class GetHistoryTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner l'historique des transactions")
        void shouldReturnTransactionHistory() throws Exception {
            // Arrange
            LocalDate debut = LocalDate.of(2025, 1, 1);
            LocalDate fin = LocalDate.of(2025, 12, 31);
            List<TransactionResponse> history = List.of(transactionResponse);

            when(transactionService.getTransactionHistory(SOURCE_IBAN, debut, fin)).thenReturn(history);

            // Act & Assert
            mockMvc.perform(get("/api/transactions/{numeroCompte}/history", SOURCE_IBAN)
                    .param("debut", "2025-01-01")
                    .param("fin", "2025-12-31"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].id").value(1));
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 404 si le compte n'existe pas")
        void shouldReturn404IfAccountNotFound() throws Exception {
            // Arrange
            when(transactionService.getTransactionHistory(eq("INVALID"), any(LocalDate.class), any(LocalDate.class)))
                    .thenThrow(new ResourceNotFoundException("Compte", "numéro", "INVALID"));

            // Act & Assert
            mockMvc.perform(get("/api/transactions/{numeroCompte}/history", "INVALID")
                    .param("debut", "2025-01-01")
                    .param("fin", "2025-12-31"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/transactions/{numeroCompte}")
    class GetAllTransactionsTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner toutes les transactions d'un compte")
        void shouldReturnAllTransactions() throws Exception {
            // Arrange
            List<TransactionResponse> transactions = List.of(transactionResponse);
            when(transactionService.getAllTransactionsByAccount(SOURCE_IBAN)).thenReturn(transactions);

            // Act & Assert
            mockMvc.perform(get("/api/transactions/{numeroCompte}", SOURCE_IBAN))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].id").value(1));

            verify(transactionService).getAllTransactionsByAccount(SOURCE_IBAN);
        }
    }
}
