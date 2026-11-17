import { describe, expect, it, vi } from 'vitest';
import { printHelp, runCli } from '../../packages/cli/src/bin';

describe('@deshapi/cli contract & unit tests', () => {
  it('prints help and exits with 0 on --help', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const code = await runCli(['--help']);
    expect(code).toBe(0);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('prints version and exits with 0 on --version', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const code = await runCli(['--version']);
    expect(code).toBe(0);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('desh v'));
    consoleSpy.mockRestore();
  });

  it('returns 1 and errors on missing postcode argument', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const code = await runCli(['postcode']);
    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Please specify a 4-digit postcode'),
    );
    errorSpy.mockRestore();
  });

  it('returns 1 on unknown command', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const code = await runCli(['nonexistent-command']);
    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown command'));
    errorSpy.mockRestore();
  });
});
