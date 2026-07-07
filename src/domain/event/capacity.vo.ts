import { InvalidCapacityError } from '../shared/domain-error';

export class Capacity {
  private constructor(
    public readonly max: number,
    public readonly current: number,
  ) {}

  static create(max: number, current = 0): Capacity {
    if (max <= 0) {
      throw new InvalidCapacityError('max capacity must be greater than zero');
    }
    if (current < 0 || current > max) {
      throw new InvalidCapacityError('current occupancy out of bounds');
    }
    return new Capacity(max, current);
  }

  isFull(): boolean {
    return this.current >= this.max;
  }

  withOneMoreOccupant(): Capacity {
    return Capacity.create(this.max, this.current + 1);
  }

  withOneLessOccupant(): Capacity {
    return Capacity.create(this.max, Math.max(0, this.current - 1));
  }
}
