import { Capacity } from './capacity.vo';
import { InvalidCapacityError } from '../shared/domain-error';

describe('Capacity', () => {
  it('creates with default current of zero', () => {
    const capacity = Capacity.create(10);
    expect(capacity.max).toBe(10);
    expect(capacity.current).toBe(0);
  });

  it('rejects a non-positive max', () => {
    expect(() => Capacity.create(0)).toThrow(InvalidCapacityError);
    expect(() => Capacity.create(-1)).toThrow(InvalidCapacityError);
  });

  it('rejects a current occupancy out of bounds', () => {
    expect(() => Capacity.create(10, -1)).toThrow(InvalidCapacityError);
    expect(() => Capacity.create(10, 11)).toThrow(InvalidCapacityError);
  });

  it('isFull() reports whether current has reached max', () => {
    expect(Capacity.create(1, 1).isFull()).toBe(true);
    expect(Capacity.create(1, 0).isFull()).toBe(false);
  });

  it('withOneMoreOccupant() increments current', () => {
    const capacity = Capacity.create(2, 0).withOneMoreOccupant();
    expect(capacity.current).toBe(1);
  });

  it('withOneMoreOccupant() throws once max is exceeded', () => {
    expect(() => Capacity.create(1, 1).withOneMoreOccupant()).toThrow(
      InvalidCapacityError,
    );
  });

  it('withOneLessOccupant() decrements current but never below zero', () => {
    expect(Capacity.create(2, 1).withOneLessOccupant().current).toBe(0);
    expect(Capacity.create(2, 0).withOneLessOccupant().current).toBe(0);
  });
});
