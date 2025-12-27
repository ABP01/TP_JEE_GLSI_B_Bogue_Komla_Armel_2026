package com.ega.egabank.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
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

import com.ega.egabank.dto.request.AccountRequest;
import com.ega.egabank.dto.response.AccountResponse;
import com.ega.egabank.dto.response.PageResponse;
import com.ega.egabank.enums.TypeCompte;
import com.ega.egabank.exception.OperationNotAllowedException;
import com.ega.egabank.exception.ResourceNotFoundException;
import com.ega.egabank.security.JwtTokenProvider;
import com.ega.egabank.service.AccountService;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Tests d'intégration pour AccountController
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Tests du contrôleur Account")
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AccountService accountService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    private ObjectMapper objectMapper;
    private AccountRequest accountRequest;
    private AccountResponse accountResponse;
    private static final String IBAN = "TG53TG0000000000000000012345678";

    @BeforeEach
    void setUp() throws Exception {
        objectMapper = new ObjectMapper();

        accountRequest = AccountRequest.builder()
                .typeCompte(TypeCompte.COURANT)
                .clientId(1L)
                .build();

        accountResponse = AccountResponse.builder()
                .id(1L)
                .numeroCompte(IBAN)
                .typeCompte(TypeCompte.COURANT)
                .typeCompteLibelle("Compte Courant")
                .solde(BigDecimal.ZERO)
                .actif(true)
                .clientId(1L)
                .clientNomComplet("Jean Dupont")
                .build();
    }

    @Nested
    @DisplayName("GET /api/accounts")
    class GetAllAccountsTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner une page de comptes")
        void shouldReturnPageOfAccounts() throws Exception {
            // Arrange
            PageResponse<AccountResponse> pageResponse = PageResponse.of(
                    List.of(accountResponse), 0, 10, 1, 1);
            when(accountService.getAllAccounts(0, 10)).thenReturn(pageResponse);

            // Act & Assert
            mockMvc.perform(get("/api/accounts")
                    .param("page", "0")
                    .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content[0].numeroCompte").value(IBAN))
                    .andExpect(jsonPath("$.totalElements").value(1));

            verify(accountService).getAllAccounts(0, 10);
        }

        @Test
        @DisplayName("Devrait retourner 401 si non authentifié")
        void shouldReturn401IfNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/accounts"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/accounts/{numeroCompte}")
    class GetAccountByNumberTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner un compte par son numéro")
        void shouldReturnAccountByNumber() throws Exception {
            // Arrange
            when(accountService.getAccountByNumber(IBAN)).thenReturn(accountResponse);

            // Act & Assert
            mockMvc.perform(get("/api/accounts/{numeroCompte}", IBAN))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.numeroCompte").value(IBAN))
                    .andExpect(jsonPath("$.typeCompte").value("COURANT"))
                    .andExpect(jsonPath("$.actif").value(true));
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 404 si le compte n'existe pas")
        void shouldReturn404IfAccountNotFound() throws Exception {
            // Arrange
            when(accountService.getAccountByNumber("INVALID"))
                    .thenThrow(new ResourceNotFoundException("Compte", "numéro", "INVALID"));

            // Act & Assert
            mockMvc.perform(get("/api/accounts/{numeroCompte}", "INVALID"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/accounts/client/{clientId}")
    class GetAccountsByClientTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner les comptes d'un client")
        void shouldReturnAccountsByClient() throws Exception {
            // Arrange
            when(accountService.getAccountsByClient(1L)).thenReturn(List.of(accountResponse));

            // Act & Assert
            mockMvc.perform(get("/api/accounts/client/{clientId}", 1L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].clientId").value(1));

            verify(accountService).getAccountsByClient(1L);
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 404 si le client n'existe pas")
        void shouldReturn404IfClientNotFound() throws Exception {
            // Arrange
            when(accountService.getAccountsByClient(999L))
                    .thenThrow(new ResourceNotFoundException("Client", "id", 999L));

            // Act & Assert
            mockMvc.perform(get("/api/accounts/client/{clientId}", 999L))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/accounts")
    class CreateAccountTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait créer un nouveau compte")
        void shouldCreateNewAccount() throws Exception {
            // Arrange
            when(accountService.createAccount(any(AccountRequest.class))).thenReturn(accountResponse);

            // Act & Assert
            mockMvc.perform(post("/api/accounts")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(accountRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.numeroCompte").value(IBAN));
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 400 si les données sont invalides")
        void shouldReturn400IfInvalidData() throws Exception {
            // Arrange
            AccountRequest invalidRequest = new AccountRequest();

            // Act & Assert
            mockMvc.perform(post("/api/accounts")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 404 si le client n'existe pas")
        void shouldReturn404IfClientNotFound() throws Exception {
            // Arrange
            when(accountService.createAccount(any(AccountRequest.class)))
                    .thenThrow(new ResourceNotFoundException("Client", "id", 999L));

            // Act & Assert
            mockMvc.perform(post("/api/accounts")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(accountRequest)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /api/accounts/{id}")
    class DeleteAccountTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait supprimer un compte")
        void shouldDeleteAccount() throws Exception {
            // Arrange
            doNothing().when(accountService).deleteAccount(1L);

            // Act & Assert
            mockMvc.perform(delete("/api/accounts/{id}", 1L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));

            verify(accountService).deleteAccount(1L);
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 400 si le solde n'est pas nul")
        void shouldReturn400IfBalanceNotZero() throws Exception {
            // Arrange
            doThrow(new OperationNotAllowedException("Solde non nul"))
                    .when(accountService).deleteAccount(1L);

            // Act & Assert
            mockMvc.perform(delete("/api/accounts/{id}", 1L))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("PUT /api/accounts/{id}/deactivate")
    class DeactivateAccountTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait désactiver un compte")
        void shouldDeactivateAccount() throws Exception {
            // Arrange
            doNothing().when(accountService).deactivateAccount(1L);

            // Act & Assert
            mockMvc.perform(put("/api/accounts/{id}/deactivate", 1L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));

            verify(accountService).deactivateAccount(1L);
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 404 si le compte n'existe pas")
        void shouldReturn404IfAccountNotFound() throws Exception {
            // Arrange
            doThrow(new ResourceNotFoundException("Compte", "id", 999L))
                    .when(accountService).deactivateAccount(999L);

            // Act & Assert
            mockMvc.perform(put("/api/accounts/{id}/deactivate", 999L))
                    .andExpect(status().isNotFound());
        }
    }
}
