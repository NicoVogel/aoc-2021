import { readFileSync } from 'fs';

type FishStatus = number;
type AccumulatedFishStatus = FishStatus[];

const values = getValues();
const accumulatedValues = accumulateStatus(values);

const after80Days = runGenerations(80, accumulatedValues);
console.log('after 80 days', calculateFish(after80Days));

const after256Days = runGenerations(256, accumulatedValues);
console.log('after 256 days', calculateFish(after256Days));

function getValues() {
  return readFileSync('src/day6/data.txt').toString().split(',').map(toNumber);
}

function toNumber(value: string): number {
  return Number(value);
}

function accumulateStatus(inputStatus: FishStatus[]): AccumulatedFishStatus {
  return inputStatus.reduce<AccumulatedFishStatus>((acc, status) => {
    acc[status]++;
    return acc;
  }, createBaseAccumulate());
}

function createBaseAccumulate(): AccumulatedFishStatus {
  return Array.apply(null, Array(9)).map(() => 0);
}

function nextGeneration(
  currentStatus: AccumulatedFishStatus
): AccumulatedFishStatus {
  const [newBreed, ...newStatus] = currentStatus;
  newStatus[6] += newBreed;
  newStatus[8] = newBreed;
  return newStatus;
}

function runGenerations(
  amount: number,
  startStatus: FishStatus[]
): FishStatus[] {
  let result = startStatus;
  for (let i = 0; i < amount; i++) {
    result = nextGeneration(result);
  }
  return result;
}

function calculateFish(fish: AccumulatedFishStatus): number {
  return fish.reduce<number>((acc, value) => acc + value, 0);
}
