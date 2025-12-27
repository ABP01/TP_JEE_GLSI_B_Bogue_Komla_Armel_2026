package com.ega.egabank.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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

import com.ega.egabank.dto.request.ClientRequest;
import com.ega.egabank.dto.response.ClientResponse;
import com.ega.egabank.dto.response.PageResponse;
import com.ega.egabank.enums.Sexe;
import com.ega.egabank.exception.DuplicateResourceException;
import com.ega.egabank.exception.ResourceNotFoundException;
import com.ega.egabank.security.JwtTokenProvider;
import com.ega.egabank.service.ClientService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/**
 * Tests d'intégration pour ClientController
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Tests du contrôleur Client")
class ClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClientService clientService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    private ObjectMapper objectMapper;
    private ClientRequest clientRequest;
    private ClientResponse clientResponse;

    @BeforeEach
    void setUp() throws Exception {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        clientRequest = ClientRequest.builder()
                .nom("Dupont")
                .prenom("Jean")
                .dateNaissance(LocalDate.of(1990, 5, 15))
                .sexe(Sexe.MASCULIN)
                .courriel("jean.dupont@email.com")
                .telephone("+22890123456")
                .adresse("123 Rue de la Paix, Lomé")
                .nationalite("Togolaise")
                .build();

        clientResponse = ClientResponse.builder()
                .id(1L)
                .nom("Dupont")
                .prenom("Jean")
                .nomComplet("Jean Dupont")
                .dateNaissance(LocalDate.of(1990, 5, 15))
                .sexe(Sexe.MASCULIN)
                .courriel("jean.dupont@email.com")
                .telephone("+22890123456")
                .adresse("123 Rue de la Paix, Lomé")
                .nationalite("Togolaise")
                .nombreComptes(0)
                .build();
    }

    @Nested
    @DisplayName("GET /api/clients")
    class GetAllClientsTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner une page de clients")
        void shouldReturnPageOfClients() throws Exception {
            // Arrange
            PageResponse<ClientResponse> pageResponse = PageResponse.of(
                    List.of(clientResponse), 0, 10, 1, 1);
            when(clientService.getAllClients(0, 10)).thenReturn(pageResponse);

            // Act & Assert
            mockMvc.perform(get("/api/clients")
                    .param("page", "0")
                    .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content[0].nom").value("Dupont"))
                    .andExpect(jsonPath("$.totalElements").value(1));

            verify(clientService).getAllClients(0, 10);
        }

        @Test
        @DisplayName("Devrait retourner 401 si non authentifié")
        void shouldReturn401IfNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/clients"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/clients/search")
    class SearchClientsTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait rechercher des clients")
        void shouldSearchClients() throws Exception {
            // Arrange
            PageResponse<ClientResponse> pageResponse = PageResponse.of(
                    List.of(clientResponse), 0, 10, 1, 1);
            when(clientService.searchClients("Dupont", 0, 10)).thenReturn(pageResponse);

            // Act & Assert
            mockMvc.perform(get("/api/clients/search")
                    .param("q", "Dupont")
                    .param("page", "0")
                    .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].nom").value("Dupont"));

            verify(clientService).searchClients("Dupont", 0, 10);
        }
    }

    @Nested
    @DisplayName("GET /api/clients/{id}")
    class GetClientByIdTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner un client existant")
        void shouldReturnExistingClient() throws Exception {
            // Arrange
            when(clientService.getClientById(1L)).thenReturn(clientResponse);

            // Act & Assert
            mockMvc.perform(get("/api/clients/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.nom").value("Dupont"))
                    .andExpect(jsonPath("$.prenom").value("Jean"));
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 404 si le client n'existe pas")
        void shouldReturn404IfClientNotFound() throws Exception {
            // Arrange
            when(clientService.getClientById(999L))
                    .thenThrow(new ResourceNotFoundException("Client", "id", 999L));

            // Act & Assert
            mockMvc.perform(get("/api/clients/999"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/clients/{id}/details")
    class GetClientWithAccountsTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner un client avec ses comptes")
        void shouldReturnClientWithAccounts() throws Exception {
            // Arrange
            when(clientService.getClientWithAccounts(1L)).thenReturn(clientResponse);

            // Act & Assert
            mockMvc.perform(get("/api/clients/1/details"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1));

            verify(clientService).getClientWithAccounts(1L);
        }
    }

    @Nested
    @DisplayName("POST /api/clients")
    class CreateClientTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait créer un nouveau client")
        void shouldCreateNewClient() throws Exception {
            // Arrange
            when(clientService.createClient(any(ClientRequest.class))).thenReturn(clientResponse);

            // Act & Assert
            mockMvc.perform(post("/api/clients")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(clientRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.nom").value("Dupont"));
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 400 si les données sont invalides")
        void shouldReturn400IfInvalidData() throws Exception {
            // Arrange
            ClientRequest invalidRequest = new ClientRequest();
            invalidRequest.setNom(""); // Nom vide - invalide

            // Act & Assert
            mockMvc.perform(post("/api/clients")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 409 si le courriel existe déjà")
        void shouldReturn409IfEmailExists() throws Exception {
            // Arrange
            when(clientService.createClient(any(ClientRequest.class)))
                    .thenThrow(new DuplicateResourceException("Client", "courriel", "jean.dupont@email.com"));

            // Act & Assert
            mockMvc.perform(post("/api/clients")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(clientRequest)))
                    .andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("PUT /api/clients/{id}")
    class UpdateClientTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait mettre à jour un client")
        void shouldUpdateClient() throws Exception {
            // Arrange
            ClientResponse updatedResponse = ClientResponse.builder()
                    .id(1L)
                    .nom("DupontModifié")
                    .prenom("Jean")
                    .build();
            when(clientService.updateClient(eq(1L), any(ClientRequest.class))).thenReturn(updatedResponse);

            // Act & Assert
            mockMvc.perform(put("/api/clients/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(clientRequest)))
                    .andExpect(status().isOk());

            verify(clientService).updateClient(eq(1L), any(ClientRequest.class));
        }
    }

    @Nested
    @DisplayName("DELETE /api/clients/{id}")
    class DeleteClientTests {

        @Test
        @WithMockUser
        @DisplayName("Devrait supprimer un client")
        void shouldDeleteClient() throws Exception {
            // Arrange
            doNothing().when(clientService).deleteClient(1L);

            // Act & Assert
            mockMvc.perform(delete("/api/clients/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));

            verify(clientService).deleteClient(1L);
        }

        @Test
        @WithMockUser
        @DisplayName("Devrait retourner 404 si le client n'existe pas")
        void shouldReturn404IfClientNotFoundForDeletion() throws Exception {
            // Arrange
            doThrow(new ResourceNotFoundException("Client", "id", 999L))
                    .when(clientService).deleteClient(999L);

            // Act & Assert
            mockMvc.perform(delete("/api/clients/999"))
                    .andExpect(status().isNotFound());
        }
    }
}
