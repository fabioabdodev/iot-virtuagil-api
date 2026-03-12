import { validateEnv } from './env';

describe('validateEnv', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns parsed environment when config is valid', () => {
    const result = validateEnv({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/app',
      PORT: '3001',
      LOG_LEVEL: 'warn',
    });

    expect(result).toEqual(
      expect.objectContaining({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/app',
        PORT: 3001,
        LOG_LEVEL: 'warn',
      }),
    );
  });

  it('throws and logs when config is invalid', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    expect(() => validateEnv({})).toThrow('Configuração de ambiente inválida');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erro nas variáveis de ambiente:',
      expect.objectContaining({
        DATABASE_URL: expect.any(Array),
      }),
    );
  });
});
