package com.ega.egabank.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.ega.egabank.dto.request.LoginRequest;
import com.ega.egabank.dto.request.RegisterRequest;
import com.ega.egabank.dto.response.AuthResponse;
import com.ega.egabank.exception.DuplicateResourceException;
import com.ega.egabank.security.JwtTokenProvider;
import com.ega.egabank.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Tests d'intégration pour AuthController
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Tests du contrôleur Auth")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    private ObjectMapper objectMapper;
    private LoginRequest loginRequest;
    private RegisterRequest registerRequest;
    private AuthResponse authResponse;

        @BeforeEach
        void setUp() throws Exception {
        objectMapper = new ObjectMapper();

        loginRequest = LoginRequest.builder()
                .username("testuser")
                .password("password123")
                .build();

        registerRequest = RegisterRequest.builder()
                .username("newuser")
                .email("newuser@email.com")
                .password("password123")
                .build();

        authResponse = AuthResponse.of(
                "access-token-jwt",
                "refresh-token-jwt",
                3600L,
                "testuser",
                "testuser@email.com",
                "ROLE_USER");
    }

    @Nested
    @DisplayName("POST /api/auth/register")
    class RegisterTests {

        @Test
        @DisplayName("Devrait inscrire un nouvel utilisateur avec succès")
        void shouldRegisterSuccessfully() throws Exception {
            // Arrange
            when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

            // Act & Assert
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(registerRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.accessToken").value("access-token-jwt"))
                    .andExpect(jsonPath("$.username").value("testuser"))
                    .andExpect(jsonPath("$.role").value("ROLE_USER"));

            verify(authService).register(any(RegisterRequest.class));
        }

        @Test
        @DisplayName("Devrait retourner 409 si le nom d'utilisateur existe déjà")
        void shouldReturn409IfUsernameExists() throws Exception {
            // Arrange
            when(authService.register(any(RegisterRequest.class)))
                    .thenThrow(new DuplicateResourceException("Utilisateur", "username", "newuser"));

            // Act & Assert
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(registerRequest)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("Devrait retourner 409 si l'email existe déjà")
        void shouldReturn409IfEmailExists() throws Exception {
            // Arrange
            when(authService.register(any(RegisterRequest.class)))
                    .thenThrow(new DuplicateResourceException("Utilisateur", "email", "newuser@email.com"));

            // Act & Assert
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(registerRequest)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("Devrait retourner 400 si les données sont invalides")
        void shouldReturn400IfInvalidData() throws Exception {
            // Arrange
            RegisterRequest invalidRequest = RegisterRequest.builder()
                    .username("") // Username vide
                    .email("invalid-email") // Email invalide
                    .password("123") // Password trop court
                    .build();

            // Act & Assert
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Devrait retourner 400 si le username est manquant")
        void shouldReturn400IfUsernameMissing() throws Exception {
            // Arrange
            RegisterRequest invalidRequest = RegisterRequest.builder()
                    .email("test@email.com")
                    .password("password123")
                    .build();

            // Act & Assert
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/login")
    class LoginTests {

        @Test
        @DisplayName("Devrait connecter un utilisateur avec succès")
        void shouldLoginSuccessfully() throws Exception {
            // Arrange
            when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

            // Act & Assert
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").value("access-token-jwt"))
                    .andExpect(jsonPath("$.refreshToken").value("refresh-token-jwt"))
                    .andExpect(jsonPath("$.username").value("testuser"));

            verify(authService).login(any(LoginRequest.class));
        }

        @Test
        @DisplayName("Devrait retourner 401 si les identifiants sont invalides")
        void shouldReturn401IfInvalidCredentials() throws Exception {
            // Arrange
            when(authService.login(any(LoginRequest.class)))
                    .thenThrow(
                            new org.springframework.security.authentication.BadCredentialsException("Bad credentials"));

            // Act & Assert
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Devrait retourner 400 si les données sont manquantes")
        void shouldReturn400IfDataMissing() throws Exception {
            // Arrange
            LoginRequest invalidRequest = new LoginRequest();

            // Act & Assert
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/refresh")
    class RefreshTokenTests {

        @Test
        @DisplayName("Devrait rafraîchir le token avec succès")
        void shouldRefreshTokenSuccessfully() throws Exception {
            // Arrange
            when(authService.refreshToken("valid-refresh-token")).thenReturn(authResponse);

            // Act & Assert
            mockMvc.perform(post("/api/auth/refresh")
                    .param("refreshToken", "valid-refresh-token"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").value("access-token-jwt"));

            verify(authService).refreshToken("valid-refresh-token");
        }

        @Test
        @DisplayName("Devrait retourner 400 si le refresh token est invalide")
        void shouldReturn400IfInvalidRefreshToken() throws Exception {
            // Arrange
            when(authService.refreshToken("invalid-token"))
                    .thenThrow(new RuntimeException("Token de rafraîchissement invalide"));

            // Act & Assert
            mockMvc.perform(post("/api/auth/refresh")
                    .param("refreshToken", "invalid-token"))
                    .andExpect(status().isInternalServerError());
        }
    }
}
