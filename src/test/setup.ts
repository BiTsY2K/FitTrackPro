// Quiet noisy native warnings in tests.
jest.spyOn(console, 'warn').mockImplementation(() => undefined);
