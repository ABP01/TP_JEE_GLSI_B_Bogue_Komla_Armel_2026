# Backend DTO → Frontend Validators Mapping

This document maps backend DTO constraints to Angular form validators implemented in the frontend.

## RegisterRequest
- `username`: @NotBlank, @Size(min=3,max=50)
  - Frontend: `Validators.required`, `Validators.minLength(3)`, `Validators.maxLength(50)`
- `email`: @NotBlank, @Email
  - Frontend: `Validators.required`, `Validators.email`
- `password`: @NotBlank, @Size(min=6,max=100)
  - Frontend: `Validators.required`, `Validators.minLength(6)`, `Validators.maxLength(100)`

## ClientRequest
- `nom`: @NotBlank, @Size(min=2,max=50)
  - Frontend: `Validators.required`, `Validators.minLength(2)`, `Validators.maxLength(50)`
- `prenom`: @NotBlank, @Size(min=2,max=50)
  - Frontend: `Validators.required`, `Validators.minLength(2)`, `Validators.maxLength(50)`
- `dateNaissance`: @NotNull, @Past
  - Frontend: `Validators.required` (ensure date input type and optionally client-side check to be in the past)
- `sexe`: @NotNull
  - Frontend: `Validators.required` on select control
- `adresse`: @Size(max=200)
  - Frontend: `Validators.maxLength(200)`
- `telephone`: @Pattern(^\\+?[0-9]{8,15}$)
  - Frontend: `Validators.pattern(/^\\+?[0-9]{8,15}$/)`
- `courriel`: @Email
  - Frontend: `Validators.email`
- `nationalite`: @Size(max=50)
  - Frontend: `Validators.maxLength(50)`

## OperationRequest (Deposit / Withdraw)
- `montant`: @NotNull, @Positive
  - Frontend: `Validators.required`, `Validators.min(0.01)`
- `description`: optional

## TransferRequest
- `compteSource`: @NotBlank
  - Frontend: `Validators.required`
- `compteDestination`: @NotBlank
  - Frontend: `Validators.required`
- `montant`: @NotNull, @Positive
  - Frontend: `Validators.required`, `Validators.min(0.01)`
- `description`: optional

## AccountRequest
- `typeCompte`: @NotNull
  - Frontend: `Validators.required` on account creation form
- `clientId`: @NotNull
  - Frontend: `Validators.required` when creating account from client detail


Notes
- Server-side validation remains authoritative; frontend validators are UX helpers to reduce invalid submissions.
- Date fields should be submitted in `yyyy-MM-dd` to match backend LocalDate parsing.
