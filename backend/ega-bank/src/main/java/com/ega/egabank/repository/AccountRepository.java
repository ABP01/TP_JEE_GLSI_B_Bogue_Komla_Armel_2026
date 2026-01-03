package com.ega.egabank.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ega.egabank.entity.Account;
import com.ega.egabank.enums.TypeCompte;

/**
 * Repository pour la gestion des comptes bancaires
 */
@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByNumeroCompte(String numeroCompte);

    boolean existsByNumeroCompte(String numeroCompte);

    List<Account> findByProprietaireId(Long clientId);

    Page<Account> findByProprietaireId(Long clientId, Pageable pageable);

    List<Account> findByTypeCompte(TypeCompte typeCompte);

    @Query("SELECT a FROM Account a WHERE a.actif = true")
    Page<Account> findAllActive(Pageable pageable);

    @Query("SELECT a FROM Account a LEFT JOIN FETCH a.proprietaire WHERE a.numeroCompte = :numero")
    Optional<Account> findByNumeroCompteWithClient(@Param("numero") String numeroCompte);

    @Query("SELECT COUNT(a) FROM Account a WHERE a.proprietaire.id = :clientId")
    long countByClientId(@Param("clientId") Long clientId);

    // Méthodes pour les statistiques du dashboard
    long countByActifTrue();

    @Query("SELECT COALESCE(SUM(a.solde), 0) FROM Account a")
    BigDecimal sumAllBalances();

    @Query("SELECT COALESCE(SUM(a.solde), 0) FROM Account a WHERE a.actif = true")
    BigDecimal sumActiveBalances();
}
