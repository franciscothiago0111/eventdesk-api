import { randomBytes } from 'crypto';

export class CheckInCode {
  private constructor(public readonly value: string) {}

  static generate(): CheckInCode {
    return new CheckInCode(randomBytes(6).toString('hex').toUpperCase());
  }

  static fromExisting(value: string): CheckInCode {
    return new CheckInCode(value);
  }

  equals(other: CheckInCode): boolean {
    return this.value === other.value;
  }
}
