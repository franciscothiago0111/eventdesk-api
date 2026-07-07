import { DateRange } from './date-range.vo';
import { InvalidDateRangeError } from '../shared/domain-error';

describe('DateRange', () => {
  it('creates a valid range when startDate is before endDate', () => {
    const range = DateRange.create(
      new Date('2026-01-01'),
      new Date('2026-01-02'),
    );
    expect(range.startDate).toEqual(new Date('2026-01-01'));
    expect(range.endDate).toEqual(new Date('2026-01-02'));
  });

  it('rejects a range where startDate is after endDate', () => {
    expect(() =>
      DateRange.create(new Date('2026-01-02'), new Date('2026-01-01')),
    ).toThrow(InvalidDateRangeError);
  });

  it('rejects a range where startDate equals endDate', () => {
    const date = new Date('2026-01-01');
    expect(() => DateRange.create(date, date)).toThrow(InvalidDateRangeError);
  });

  it('includes() reports whether a date falls within the range', () => {
    const range = DateRange.create(
      new Date('2026-01-01'),
      new Date('2026-01-10'),
    );
    expect(range.includes(new Date('2026-01-05'))).toBe(true);
    expect(range.includes(new Date('2026-02-01'))).toBe(false);
  });
});
