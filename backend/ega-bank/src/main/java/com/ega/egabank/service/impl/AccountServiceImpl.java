package com.ega.egabank.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ega.egabank.dto.request.AccountRequest;
import com.ega.egabank.dto.response.AccountResponse;
import com.ega.egabank.dto.response.PageResponse;
import com.ega.egabank.entity.Account;
import com.ega.egabank.entity.Client;
import com.ega.egabank.exception.OperationNotAllowedException;
import com.ega.egabank.exception.ResourceNotFoundException;
import com.ega.egabank.mapper.AccountMapper;
import com.ega.egabank.repository.AccountRepository;
import com.ega.egabank.repository.ClientRepository;
import com.ega.egabank.service.AccountService;
import com.ega.egabank.util.IbanGenerator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implémentation du service de gestion des comptes
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final ClientRepository clientRepository;
    private final AccountMapper accountMapper;
    private final IbanGenerator ibanGenerator;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AccountResponse> getAllAccounts(int page, int size) {
        log.debug("Récupération de tous les comptes - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateCreation").descending());
        // Retourner tous les comptes (actifs et inactifs)
        Page<Account> accountPage = accountRepository.findAll(pageable);

        return PageResponse.of(
                accountMapper.toResponseList(accountPage.getContent()),
                accountPage.getNumber(),
                accountPage.getSize(),
                accountPage.getTotalElements(),
                accountPage.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public AccountResponse getAccountByNumber(String numeroCompte) {
        log.debug("Récupération du compte: {}", numeroCompte);
        Account account = findAccountByNumber(numeroCompte);
        return accountMapper.toResponse(account);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountResponse> getAccountsByClient(Long clientId) {
        log.debug("Récupération des comptes du client: {}", clientId);

        // Vérifier que le client existe
        if (!clientRepository.existsById(clientId)) {
            throw new ResourceNotFoundException("Client", "id", clientId);
        }

        List<Account> accounts = accountRepository.findByProprietaireId(clientId);
        return accountMapper.toResponseList(accounts);
    }

    @Override
    public AccountResponse createAccount(AccountRequest request) {
        log.info("Création d'un nouveau compte de type {} pour le client {}",
                request.getTypeCompte(), request.getClientId());

        // Récupérer le client
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", request.getClientId()));

        // Générer un numéro IBAN unique
        String numeroCompte = generateUniqueIban();

        // Créer le compte
        Account account = Account.builder()
                .numeroCompte(numeroCompte)
                .typeCompte(request.getTypeCompte())
                .solde(BigDecimal.ZERO)
                .actif(true)
                .proprietaire(client)
                .build();

        account = accountRepository.save(account);
        log.info("Compte créé avec succès - numéro: {}", numeroCompte);

        return accountMapper.toResponse(account);
    }

    @Override
    public void deleteAccount(Long id) {
        log.info("Suppression du compte - id: {}", id);

        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compte", "id", id));

        // Vérifier que le solde est nul
        if (account.getSolde().compareTo(BigDecimal.ZERO) != 0) {
            throw new OperationNotAllowedException(
                    "Impossible de supprimer le compte: le solde n'est pas nul (" + account.getSolde() + ")");
        }

        accountRepository.delete(account);
        log.info("Compte supprimé avec succès - id: {}", id);
    }

    @Override
    public void deactivateAccount(Long id) {
        log.info("Désactivation du compte - id: {}", id);

        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compte", "id", id));

        account.setActif(false);
        accountRepository.save(account);

        log.info("Compte désactivé avec succès - id: {}", id);
    }

    private Account findAccountByNumber(String numeroCompte) {
        return accountRepository.findByNumeroCompteWithClient(numeroCompte)
                .orElseThrow(() -> new ResourceNotFoundException("Compte", "numéro", numeroCompte));
    }

    private String generateUniqueIban() {
        String iban;
        int attempts = 0;
        do {
            iban = ibanGenerator.generate();
            attempts++;
            if (attempts > 100) {
                throw new RuntimeException("Impossible de générer un numéro de compte unique");
            }
        } while (accountRepository.existsByNumeroCompte(iban));
        return iban;
    }
}
