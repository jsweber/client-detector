import { expect, test } from 'vitest';

const sum = (a, b) => a + b;

test('add 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
});
