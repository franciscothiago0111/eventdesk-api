import { CheckInCode } from './check-in-code.vo';

describe('CheckInCode', () => {
  it('generate() produces a 12-character uppercase hex code', () => {
    const code = CheckInCode.generate();
    expect(code.value).toMatch(/^[0-9A-F]{12}$/);
  });

  it('fromExisting() wraps a known value without regenerating it', () => {
    const code = CheckInCode.fromExisting('ABC123DEF456');
    expect(code.value).toBe('ABC123DEF456');
  });

  it('equals() compares by value', () => {
    const a = CheckInCode.fromExisting('ABC123DEF456');
    const b = CheckInCode.fromExisting('ABC123DEF456');
    const c = CheckInCode.fromExisting('000000000000');
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
