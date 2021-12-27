import { readFileSync } from 'fs';

const [map, total] = getValues();
const [min, max] = getMinMaxValue(map);
const range = getRange(min, max);
const fuelInRange = calculateFuel(map, range);
const smallest = findSmallestFuelCost(fuelInRange);
console.log(smallest);

function getValues() {
  return readFileSync('src/day7/data.txt')
    .toString()
    .split(',')
    .map(toNumber)
    .reduce<[Map<number, number>, number]>(
      ([map, total], value) => {
        const count = map.get(value) ?? 0;
        map.set(value, count + 1);
        return [map, total + 1];
      },
      [new Map(), 0]
    );
}

function toNumber(value: string): number {
  return Number(value);
}

function getMinMaxValue(map: Map<number, number>): [min: number, max: number] {
  return Array.from(map.entries()).reduce<[number, number]>(
    ([min, max], [value]) => {
      const newMin = min < value ? min : value;
      const newMax = max > value ? max : value;
      return [newMin, newMax];
    },
    [Number.MAX_VALUE, Number.MIN_VALUE]
  );
}

function getRange(min: number, max: number): number[] {
  const diff = max - min;
  return Array.from('x'.repeat(diff)).map((_, i) => i + min);
}

function calculateFuel(
  map: Map<number, number>,
  range: number[]
): [range: number, fuel: number][] {
  return range.map((slot) => calculateFuelToSlot(map, slot));
}

function calculateFuelToSlot(
  map: Map<number, number>,
  slot: number
): [range: number, fuel: number] {
  return Array.from(map.entries()).reduce<[number, number]>(
    ([range, totalFuel], [position, amount]) => {
      return [range, totalFuel + calculateFuelCost(position, range, amount)];
    },
    [slot, 0]
  );
}

function calculateFuelCost(from: number, to: number, amount: number): number {
  const diff = Math.abs(from - to);
  let cost = 0;
  for (let i = 0; i < diff; i++) {
    cost += i + 1;
  }
  return cost * amount;
}

function findSmallestFuelCost(
  rangeFuelTuple: [range: number, fuel: number][]
): [range: number, fuel: number] {
  return rangeFuelTuple.reduce<[number, number]>(
    ([curRange, curFuel], [range, fuel]) => {
      if (curRange === 0) {
        return [range, fuel];
      }
      if (curFuel > fuel) {
        return [range, fuel];
      }
      return [curRange, curFuel];
    },
    [0, 0]
  );
}
