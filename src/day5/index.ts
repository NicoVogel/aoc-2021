import { readFileSync } from 'fs';
type Point = {
  x: number;
  y: number;
};
type Line = {
  from: Point;
  to: Point;
};
type Plot = number[][];

const lines = getValues();
const onlyHorizontalAndVerticalLines = filterStrait(lines);
const onlyDiagonalLines = filterDiagonals(lines);

const plot = initPlot();
plotStraitLines(plot, onlyHorizontalAndVerticalLines);
plotDiagonalLines(plot, onlyDiagonalLines);
const result = countTwoOrMoreIntersections(plot);

console.log(result);

function getValues(): Line[] {
  return readFileSync('src/day5/data.txt')
    .toString()
    .split('\n')
    .filter(notEmptyString)
    .map((x) => {
      const [fromRaw, toRaw] = x.split(' -> ');
      const from = rawPointToNumbers(fromRaw);
      const to = rawPointToNumbers(toRaw);
      return {
        from,
        to,
      };
    });
}

function rawPointToNumbers(rawPoint: string): Point {
  const [x, y] = rawPoint.split(',').filter(notEmptyString).map(toNumber);
  return { x, y };
}

function notEmptyString(value: string): boolean {
  return value !== '';
}

function toNumber(value: string): number {
  return Number(value);
}

function getStartAndEndValues({ from, to }: Line): Line {
  const xValues = [from.x, to.x];
  const yValues = [from.y, to.y];
  const buildPoint =
    (xs: number[], ys: number[]) =>
    (determine: (...args: number[]) => number): Point => {
      return {
        x: determine(...xs),
        y: determine(...ys),
      };
    };
  const builder = buildPoint(xValues, yValues);

  const start = builder(Math.min);
  const end = builder(Math.max);
  return {
    from: start,
    to: end,
  };
}

function filterStrait(lines: Line[]): Line[] {
  return lines.filter(({ from, to }) => from.x === to.x || from.y === to.y);
}

function filterDiagonals(lines: Line[]): Line[] {
  return lines.filter(({ from, to }) => {
    if (from.x == from.y && to.x === to.y) {
      return true;
    }

    const unified = getStartAndEndValues({ from, to });
    const differenceX = unified.from.x - unified.from.y;
    const differenceY = unified.to.x - unified.to.y;
    if (differenceX === differenceY) {
      return true;
    }

    return false;
  });
}

function initPlot(size = 1000): Plot {
  const createArray = <T>(map: () => T) =>
    Array.apply(null, Array(size)).map(map);
  return createArray(() => createArray(() => 0));
}

function plotStraitLines(plot: Plot, lines: Line[]) {
  lines.forEach((line) => {
    const { from, to } = getStartAndEndValues(line);
    for (let x = from.x; x <= to.x; x++) {
      for (let y = from.y; y <= to.y; y++) {
        // console.log('s', { from, to, x, y });
        plot[x][y] += 1;
      }
    }
  });
}

function plotDiagonalLines(plot: Plot, lines: Line[]) {
  lines.forEach((line) => {
    if (line.from.x === line.from.y) {
      for (let x = line.from.x; x <= line.to.x; x++) {
        // console.log('d', { ...line, x });
        plot[x][x] += 1;
      }
      return;
    }
    const { from, to } = getStartAndEndValues(line);
    let y = to.y;
    for (let x = from.x; x <= to.x; x++, y--) {
      // console.log('d', { from, to, x, y });
      plot[x][y] += 1;
    }
  });
}

function countTwoOrMoreIntersections(plot: Plot): number {
  let count = 0;
  for (let x = 0; x < plot.length; x++) {
    const row = plot[x];
    for (let y = 0; y < row.length; y++) {
      const cell = row[y];
      if (cell > 1) {
        count++;
      }
    }
  }
  return count;
}

//
// testing the logic
//

const testPlot = initPlot(10);
const testLines = [
  {
    from: {
      x: 3,
      y: 7,
    },
    to: {
      x: 6,
      y: 4,
    },
  },
  {
    from: {
      x: 1,
      y: 1,
    },
    to: {
      x: 5,
      y: 5,
    },
  },
  {
    from: {
      x: 3,
      y: 1,
    },
    to: {
      x: 3,
      y: 9,
    },
  },
];
const testLinesStrait = filterStrait(testLines);
const testLinesDia = filterDiagonals(testLines);

plotStraitLines(testPlot, testLinesStrait);
plotDiagonalLines(testPlot, testLinesDia);
console.log(' ', ...Array.from('x'.repeat(10)).map((_, i) => i));
testPlot.forEach((row, index) => {
  console.log(index, ...row.map((x) => (x === 0 ? ' ' : x)));
});
