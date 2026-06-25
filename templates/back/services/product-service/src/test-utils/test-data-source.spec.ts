import { assertIsTestDatabase } from './test-data-source';

describe('assertIsTestDatabase', () => {
  it('ne lève pas d\'erreur si le nom de la base contient "test"', () => {
    expect(() => assertIsTestDatabase('product_db_test')).not.toThrow();
    expect(() => assertIsTestDatabase('TEST_product_db')).not.toThrow();
  });

  it('lève une erreur si le nom de la base ne contient pas "test"', () => {
    expect(() => assertIsTestDatabase('product_db')).toThrow(/Refusing to run tests/);
  });

  it('lève une erreur si le nom de la base est vide ou indéfini', () => {
    expect(() => assertIsTestDatabase(undefined)).toThrow(/Refusing to run tests/);
    expect(() => assertIsTestDatabase('')).toThrow(/Refusing to run tests/);
  });
});
