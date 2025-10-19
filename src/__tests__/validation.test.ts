/**
 * Tests unitaires pour les fonctions de validation
 * 
 * Ces tests couvrent les fonctions critiques de validation et de sécurité
 * pour s'assurer que l'application est protégée contre les attaques courantes.
 */

import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPhone,
  sanitizeString,
  isValidSlug,
  generateSlug,
  isValidAmount,
  isValidUrl,
  isValidUUID,
  validateAndSanitizeInput,
} from '@/lib/validation';

describe('Validation Functions', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhone('+22670123456')).toBe(true);
      expect(isValidPhone('22670123456')).toBe(true);
      expect(isValidPhone('70123456')).toBe(true);
      expect(isValidPhone('+1 555 123 4567')).toBe(false); // Espaces non autorisés
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('+226 70 12 34 56')).toBe(false); // Espaces
    });
  });

  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeString('<div>Hello</div>')).toBe('divHellodiv');
      expect(sanitizeString('<img src="x" onerror="alert(1)">')).toBe('img src="x" onerror="alert(1)"');
    });

    it('should remove quotes', () => {
      expect(sanitizeString('Hello "world"')).toBe('Hello world');
      expect(sanitizeString("It's a test")).toBe('Its a test');
    });

    it('should handle empty and null inputs', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
    });

    it('should preserve safe content', () => {
      expect(sanitizeString('Hello World')).toBe('Hello World');
      expect(sanitizeString('123456')).toBe('123456');
      expect(sanitizeString('user@example.com')).toBe('user@example.com');
    });
  });

  describe('isValidSlug', () => {
    it('should validate correct slugs', () => {
      expect(isValidSlug('hello-world')).toBe(true);
      expect(isValidSlug('product-123')).toBe(true);
      expect(isValidSlug('a')).toBe(false); // Trop court
      expect(isValidSlug('very-long-slug-that-is-still-valid')).toBe(true);
    });

    it('should reject invalid slugs', () => {
      expect(isValidSlug('Hello World')).toBe(false); // Espaces
      expect(isValidSlug('hello_world')).toBe(false); // Underscores
      expect(isValidSlug('hello.world')).toBe(false); // Points
      expect(isValidSlug('hello@world')).toBe(false); // Caractères spéciaux
      expect(isValidSlug('')).toBe(false);
      expect(isValidSlug('a'.repeat(51))).toBe(false); // Trop long
    });
  });

  describe('generateSlug', () => {
    it('should generate valid slugs from text', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Product 123!')).toBe('product-123');
      expect(generateSlug('Café & Restaurant')).toBe('caf-restaurant');
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces');
    });

    it('should handle edge cases', () => {
      expect(generateSlug('')).toBe('untitled-' + expect.any(String));
      expect(generateSlug('   ')).toBe('untitled-' + expect.any(String));
      expect(generateSlug('!@#$%^&*()')).toBe('untitled-' + expect.any(String));
    });
  });

  describe('isValidAmount', () => {
    it('should validate correct amounts', () => {
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount(0.01)).toBe(true);
      expect(isValidAmount(999999.99)).toBe(true);
    });

    it('should reject invalid amounts', () => {
      expect(isValidAmount(0)).toBe(false);
      expect(isValidAmount(-100)).toBe(false);
      expect(isValidAmount(1000000)).toBe(false); // Trop élevé
      expect(isValidAmount(NaN)).toBe(false);
      expect(isValidAmount(Infinity)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://subdomain.example.com/path?query=value')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false); // Protocole non autorisé
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false); // Protocole dangereux
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('00000000-0000-0000-0000-000000000000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false); // Incomplet
      expect(isValidUUID('')).toBe(false);
    });
  });

  describe('validateAndSanitizeInput', () => {
    it('should validate and sanitize email input', () => {
      expect(validateAndSanitizeInput('test@example.com', 'email')).toBe('test@example.com');
      expect(validateAndSanitizeInput('invalid-email', 'email')).toBe(null);
      expect(validateAndSanitizeInput('<script>alert(1)</script>@example.com', 'email')).toBe(null);
    });

    it('should validate and sanitize phone input', () => {
      expect(validateAndSanitizeInput('+22670123456', 'phone')).toBe('+22670123456');
      expect(validateAndSanitizeInput('invalid-phone', 'phone')).toBe(null);
    });

    it('should validate and sanitize amount input', () => {
      expect(validateAndSanitizeInput('100', 'amount')).toBe('100');
      expect(validateAndSanitizeInput('0', 'amount')).toBe(null);
      expect(validateAndSanitizeInput('-50', 'amount')).toBe(null);
    });

    it('should validate and sanitize URL input', () => {
      expect(validateAndSanitizeInput('https://example.com', 'url')).toBe('https://example.com');
      expect(validateAndSanitizeInput('javascript:alert(1)', 'url')).toBe(null);
    });

    it('should validate and sanitize string input', () => {
      expect(validateAndSanitizeInput('Hello World', 'string')).toBe('Hello World');
      expect(validateAndSanitizeInput('<script>alert(1)</script>', 'string')).toBe('scriptalert(1)/script');
      expect(validateAndSanitizeInput('', 'string')).toBe(null);
    });
  });
});

describe('Security Tests', () => {
  describe('XSS Protection', () => {
    it('should prevent XSS attacks in sanitizeString', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<svg onload="alert(1)"></svg>',
        'javascript:alert(1)',
        '<link rel="stylesheet" href="javascript:alert(1)">',
      ];

      maliciousInputs.forEach(input => {
        const sanitized = sanitizeString(input);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('onerror');
        expect(sanitized).not.toContain('onload');
        expect(sanitized).not.toContain('javascript:');
      });
    });
  });

  describe('SQL Injection Protection', () => {
    it('should escape SQL special characters', () => {
      const { escapeSqlString } = require('@/lib/validation');
      
      expect(escapeSqlString("O'Reilly")).toBe("O''Reilly");
      expect(escapeSqlString('He said "Hello"')).toBe('He said "Hello"');
      expect(escapeSqlString("'; DROP TABLE users; --")).toBe("''; DROP TABLE users; --");
    });
  });
});
