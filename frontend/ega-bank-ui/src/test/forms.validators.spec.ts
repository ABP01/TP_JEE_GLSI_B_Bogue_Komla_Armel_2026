import { FormBuilder, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';

describe('Form validators mapping', () => {
  const fb = new FormBuilder();

  it('register form should enforce username/email/password constraints', () => {
    const form = fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]]
    });

    form.get('username')!.setValue('ab');
    expect(form.get('username')!.valid).toBe(false);
    form.get('username')!.setValue('abc');
    expect(form.get('username')!.valid).toBe(true);

    form.get('email')!.setValue('not-an-email');
    expect(form.get('email')!.valid).toBe(false);
    form.get('email')!.setValue('user@example.com');
    expect(form.get('email')!.valid).toBe(true);

    form.get('password')!.setValue('12345');
    expect(form.get('password')!.valid).toBe(false);
    form.get('password')!.setValue('123456');
    expect(form.get('password')!.valid).toBe(true);
  });

  it('client form should enforce name lengths and telephone pattern', () => {
    const form = fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      telephone: ['', [Validators.pattern(/^\+?[0-9]{8,15}$/)]],
      adresse: ['', [Validators.maxLength(200)]],
      nationalite: ['', [Validators.maxLength(50)]]
    });

    form.get('nom')!.setValue('A');
    expect(form.get('nom')!.valid).toBe(false);
    form.get('nom')!.setValue('Al');
    expect(form.get('nom')!.valid).toBe(true);

    form.get('telephone')!.setValue('123');
    expect(form.get('telephone')!.valid).toBe(false);
    form.get('telephone')!.setValue('+33123456789');
    expect(form.get('telephone')!.valid).toBe(true);
  });

  it('operation/transfer forms should require positive montant', () => {
    const opForm = fb.group({
      montant: ['', [Validators.required, Validators.min(0.01)]],
      description: ['']
    });

    opForm.get('montant')!.setValue(0);
    expect(opForm.get('montant')!.valid).toBe(false);
    opForm.get('montant')!.setValue(0.01);
    expect(opForm.get('montant')!.valid).toBe(true);

    const trForm = fb.group({
      compteSource: ['', Validators.required],
      compteDestination: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0.01)]],
      description: ['']
    });

    trForm.get('compteSource')!.setValue('');
    expect(trForm.get('compteSource')!.valid).toBe(false);
    trForm.get('compteSource')!.setValue('ACC123');
    expect(trForm.get('compteSource')!.valid).toBe(true);
  });
});
