import { InvalidDateRangeError } from '../shared/domain-error';

export class DateRange {
  private constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
  ) {}

  static create(startDate: Date, endDate: Date): DateRange {
    if (startDate >= endDate) {
      throw new InvalidDateRangeError('startDate must be before endDate');
    }
    return new DateRange(startDate, endDate);
  }

  includes(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }
}
