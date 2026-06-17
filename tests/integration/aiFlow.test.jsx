import { describe, it, expect } from 'vitest';
import { improveQuestion, summarizeAnswers } from '../../src/services/aiService';
import { mockUsers, mockAnswers } from '../mocks/mockData';

/**
 * Integration Tests: AI Service Flow with MSW
 * Verifies that AI service functions work correctly with MSW-intercepted API calls.
 * No component rendering — pure service + API integration.
 */

const TOKEN = mockUsers.user1.token;

describe('AI Flow Integration Tests (Service + MSW)', () => {
  describe('improveQuestion', () => {
    it('should return improved title, description, and tags on success with valid token', async () => {
      const payload = {
        title: 'How do I manage state in React?',
        description: 'I want to understand the best way to manage component state.',
        tags: ['javascript', 'react'],
      };

      const result = await improveQuestion(payload, TOKEN);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('tags');
    });

    it('should return an object with title, description, and tags properties', async () => {
      const payload = {
        title: 'What is the virtual DOM?',
        description: 'Can someone explain what the virtual DOM is and why it matters?',
        tags: ['react'],
      };

      const result = await improveQuestion(payload, TOKEN);

      expect(typeof result.title).toBe('string');
      expect(typeof result.description).toBe('string');
      expect(result.tags).toBeDefined();
    });

    it('should return an improved title that starts with "Improved:"', async () => {
      const payload = {
        title: 'How do I center a div in CSS?',
        description: 'I have tried everything but I cannot center this div.',
        tags: ['css'],
      };

      const result = await improveQuestion(payload, TOKEN);

      expect(result.title).toMatch(/^Improved:/);
    });

    it('should throw when called without a token (401 from server)', async () => {
      const payload = {
        title: 'How do I manage state in React?',
        description: 'I want to understand the best way to manage component state.',
        tags: ['javascript', 'react'],
      };

      await expect(improveQuestion(payload, null)).rejects.toThrow();
    });
  });

  describe('summarizeAnswers', () => {
    it('should return an object with a summary property on success with valid token', async () => {
      const payload = {
        questionText: 'How do I manage state in React?',
        answers: mockAnswers,
      };

      const result = await summarizeAnswers(payload, TOKEN);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('summary');
    });

    it('should return a non-empty summary string', async () => {
      const payload = {
        questionText: 'What is the virtual DOM?',
        answers: mockAnswers,
      };

      const result = await summarizeAnswers(payload, TOKEN);

      expect(typeof result.summary).toBe('string');
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it('should throw when called without a token (401 from server)', async () => {
      const payload = {
        questionText: 'How do I manage state in React?',
        answers: mockAnswers,
      };

      await expect(summarizeAnswers(payload, null)).rejects.toThrow();
    });
  });
});
