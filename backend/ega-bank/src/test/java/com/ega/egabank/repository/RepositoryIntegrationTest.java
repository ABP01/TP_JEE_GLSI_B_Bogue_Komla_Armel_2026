package com.ega.egabank.repository;

import static org.assertj.core.api.Assertions.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import com.ega.egabank.entity.Account;
import com.ega.egabank.entity.Client;
import com.ega.egabank.enums.Sexe;
import com.ega.egabank.enums.TypeCompte;

/**
 * Tests d'intégration pour les repositories
 */
@DataJpaTest
@ActiveProfiles("test")
@DisplayName("Tests des Repositories")
class RepositoryIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private AccountRepository accountRepository;

    private Client client1;
    private Client client2;
    private Account account1;
    private Account account2;

    @BeforeEach
    void setUp() {
        // Créer des clients de test
        client1 = Client.builder()
                .nom("Dupont")
                .prenom("Jean")
                .dateNaissance(LocalDate.of(1990, 5, 15))
                .sexe(Sexe.MASCULIN)
                .courriel("jean.dupont@email.com")
                .telephone("+22890123456")
                .adresse("123 Rue de la Paix, Lomé")
                .nationalite("Togolaise")
                .build();

        client2 = Client.builder()
                .nom("Martin")
                .prenom("Marie")
                .dateNaissance(LocalDate.of(1985, 8, 20))
                .sexe(Sexe.FEMININ)
                .courriel("marie.martin@email.com")
                .telephone("+22899876543")
                .adresse("456 Avenue de la Liberté")
                .nationalite("Française")
                .build();

        entityManager.persist(client1);
        entityManager.persist(client2);
        entityManager.flush();

        // Créer des comptes de test
        account1 = Account.builder()
                .numeroCompte("TG53TG0000000000000000012345678")
                .typeCompte(TypeCompte.COURANT)
                .solde(new BigDecimal("1000.00"))
                .actif(true)
                .proprietaire(client1)
                .build();

        account2 = Account.builder()
                .numeroCompte("TG53TG0000000000000000087654321")
                .typeCompte(TypeCompte.EPARGNE)
                .solde(new BigDecimal("5000.00"))
                .actif(true)
                .proprietaire(client1)
                .build();

        client1.getComptes().add(account1);
        client1.getComptes().add(account2);

        entityManager.persist(account1);
        entityManager.persist(account2);
        entityManager.flush();
    }

    @Nested
    @DisplayName("Tests de ClientRepository")
    class ClientRepositoryTests {

        @Test
        @DisplayName("Devrait rechercher des clients par nom")
        void shouldSearchClientsByName() {
            // Act
            Page<Client> result = clientRepository.search("Dupont", PageRequest.of(0, 10));

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getNom()).isEqualTo("Dupont");
        }

        @Test
        @DisplayName("Devrait rechercher des clients par prénom")
        void shouldSearchClientsByFirstName() {
            // Act
            Page<Client> result = clientRepository.search("Marie", PageRequest.of(0, 10));

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getPrenom()).isEqualTo("Marie");
        }

        @Test
        @DisplayName("Devrait rechercher des clients par courriel")
        void shouldSearchClientsByEmail() {
            // Act
            Page<Client> result = clientRepository.search("jean.dupont@email.com", PageRequest.of(0, 10));

            // Assert
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("Devrait vérifier l'existence par courriel")
        void shouldCheckExistsByEmail() {
            // Act & Assert
            assertThat(clientRepository.existsByCourriel("jean.dupont@email.com")).isTrue();
            assertThat(clientRepository.existsByCourriel("nonexistent@email.com")).isFalse();
        }

        @Test
        @DisplayName("Devrait trouver un client avec ses comptes")
        void shouldFindClientWithAccounts() {
            // Act
            Optional<Client> result = clientRepository.findByIdWithAccounts(client1.getId());

            // Assert
            assertThat(result).isPresent();
            assertThat(result.get().getComptes()).hasSize(2);
        }

        @Test
        @DisplayName("Devrait retourner tous les clients paginés")
        void shouldFindAllClientsPaginated() {
            // Act
            Page<Client> result = clientRepository.findAll(PageRequest.of(0, 10));

            // Assert
            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getTotalElements()).isEqualTo(2);
        }
    }

    @Nested
    @DisplayName("Tests de AccountRepository")
    class AccountRepositoryTests {

        @Test
        @DisplayName("Devrait trouver un compte par numéro")
        void shouldFindAccountByNumber() {
            // Act
            Optional<Account> result = accountRepository.findByNumeroCompte("TG53TG0000000000000000012345678");

            // Assert
            assertThat(result).isPresent();
            assertThat(result.get().getTypeCompte()).isEqualTo(TypeCompte.COURANT);
        }

        @Test
        @DisplayName("Devrait trouver un compte avec son client")
        void shouldFindAccountWithClient() {
            // Act
            Optional<Account> result = accountRepository
                    .findByNumeroCompteWithClient("TG53TG0000000000000000012345678");

            // Assert
            assertThat(result).isPresent();
            assertThat(result.get().getProprietaire()).isNotNull();
            assertThat(result.get().getProprietaire().getNom()).isEqualTo("Dupont");
        }

        @Test
        @DisplayName("Devrait trouver les comptes d'un client")
        void shouldFindAccountsByClient() {
            // Act
            List<Account> result = accountRepository.findByProprietaireId(client1.getId());

            // Assert
            assertThat(result).hasSize(2);
        }

        @Test
        @DisplayName("Devrait trouver uniquement les comptes actifs")
        void shouldFindOnlyActiveAccounts() {
            // Arrange - Désactiver un compte
            account2.setActif(false);
            entityManager.persist(account2);
            entityManager.flush();

            // Act
            Page<Account> result = accountRepository.findAllActive(PageRequest.of(0, 10));

            // Assert
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getActif()).isTrue();
        }

        @Test
        @DisplayName("Devrait vérifier l'existence par numéro de compte")
        void shouldCheckExistsByAccountNumber() {
            // Act & Assert
            assertThat(accountRepository.existsByNumeroCompte("TG53TG0000000000000000012345678")).isTrue();
            assertThat(accountRepository.existsByNumeroCompte("NONEXISTENT")).isFalse();
        }

        @Test
        @DisplayName("Devrait calculer le total des soldes d'un client")
        void shouldCalculateTotalBalanceByClient() {
            // Act
            List<Account> accounts = accountRepository.findByProprietaireId(client1.getId());
            BigDecimal total = accounts.stream()
                    .map(Account::getSolde)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Assert
            assertThat(total).isEqualByComparingTo(new BigDecimal("6000.00"));
        }
    }

    @Nested
    @DisplayName("Tests de suppression en cascade")
    class CascadeDeleteTests {

        @Test
        @DisplayName("Devrait supprimer les comptes lors de la suppression d'un client")
        void shouldDeleteAccountsWhenDeletingClient() {
            // Arrange
            Long clientId = client1.getId();
            assertThat(accountRepository.findByProprietaireId(clientId)).hasSize(2);

            // Act
            Optional<Client> client = clientRepository.findByIdWithAccounts(clientId);
            assertThat(client).isPresent();
            clientRepository.delete(client.get());
            entityManager.flush();

            // Assert
            assertThat(accountRepository.findByProprietaireId(clientId)).isEmpty();
        }
    }
}
