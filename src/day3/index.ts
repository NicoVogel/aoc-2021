import { readFileSync } from 'fs';

type BitCounts = { 0: number; 1: number };
type Values = (0 | 1)[][];
type By = 'least' | 'most';

const values = getValues();
const oxygenBinary = getOxygen(values);
const co2Binary = getCo2(values);

const oxygen = Number.parseInt(oxygenBinary, 2);
const co2 = Number.parseInt(co2Binary, 2);

const result = oxygen * co2;
console.log(result);

function getOxygen(input: Values): string {
  return getFilteredValue(input, 'most');
}

function getCo2(input: Values): string {
  return getFilteredValue(input, 'least');
}

function getFilteredValue(input: Values, by: By): string {
  let values = [...input];
  for (let index = 0; index < 12; index++) {
    const counts = getBitCounts(values, index);
    values = filterByBitCounts(values, index, counts, by);
    if (values.length === 1) {
      break;
    }
  }
  const [finalValue] = values;
  console.log({ finalValue, values, by });
  return finalValue.join('');
}

function getValues(): Values {
  return readFileSync('src/day3/data.txt')
    .toString()
    .split('\n')
    .map((line) => line.split('').map((value) => Number(value) as 0 | 1));
}

function getBitCounts(values: Values, index: number): BitCounts {
  return values.reduce<BitCounts>(
    (acc, value) => {
      const bit = value[index];
      acc[bit]++;
      return acc;
    },
    { '0': 0, '1': 0 }
  );
}

function filterByBitCounts(
  values: Values,
  index: number,
  counts: BitCounts,
  by: By
): Values {
  const take = decideFilterCriteria(counts, by);
  return values.filter((value) => value[index] === take);
}

function decideFilterCriteria(counts: BitCounts, by: By): 0 | 1 {
  const { '0': zeroCounts, '1': oneCounts } = counts;
  const valueForMoreOne = by === 'most' ? 1 : 0;
  const valueForMoreZero = by === 'most' ? 0 : 1;
  if (zeroCounts === oneCounts) return valueForMoreOne;
  if (zeroCounts < oneCounts) return valueForMoreOne;
  return valueForMoreZero;
}

// first step

// type Sum = { total: number; counts: number[] };
// const sum = data
//   .split('\n')
//   .map((line) => line.split(''))
//   .reduce<Sum>(
//     (acc, value) => {
//       acc.total++;
//       value.forEach((char, index) => (acc.counts[index] += Number(char)));
//       return acc;
//     },
//     { total: 0, counts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
//   );

// const gammaBinary = sum.counts
//   .map((count) => (count > sum.total / 2 ? 1 : 0))
//   .join('');

// const ellipseBinary = gammaBinary
//   .split('')
//   .map((value) => (value === '0' ? 1 : 0))
//   .join('');

// const gamma = Number.parseInt(gammaBinary, 2);
// const ellipse = Number.parseInt(ellipseBinary, 2);

// console.log(gamma * ellipse);
