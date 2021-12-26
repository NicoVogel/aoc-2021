import { readFileSync } from 'fs';
import { exit } from 'process';

type BingoBoardSize = 0 | 1 | 2 | 3 | 4;
type Position = [BingoBoardSize, BingoBoardSize];
type BingoBoardRow = [number, number, number, number, number];
type BingoBoard = [
  BingoBoardRow,
  BingoBoardRow,
  BingoBoardRow,
  BingoBoardRow,
  BingoBoardRow
];
type BingoData = {
  board: BingoBoard;
  lookup: Map<number, Position>;
};
type BingoDataEvaluatedNotCompleted = BingoData & {
  completed: false;
};
type BingoDataEvaluatedCompleted =
  | BingoData & {
      completed: true;
      finalNumber: number;
      indexOfFinalNumber: number;
      marks: number[];
    };
type BingoDataEvaluated =
  | BingoDataEvaluatedNotCompleted
  | BingoDataEvaluatedCompleted;

const [bingoNumbers, bingoBoards] = getValues();
const winningBoard = findWinningBoard(bingoNumbers, bingoBoards);
if (!winningBoard) {
  exit();
}
const result = calculateResult(winningBoard);
console.log(result);

function getValues(): [bingoNumbers: number[], bingoData: BingoData[]] {
  const [bingoNumbersRaw, ...bingoRawData] = readFileSync('src/day4/data.txt')
    .toString()
    .split('\n');
  const bingoNumbers = bingoNumbersRaw.split(',').map(toNumber);
  const bingoData = bingoRawData
    .filter((x) => x !== '')
    .reduce<BingoData[]>((acc, line, index) => {
      const columnIndex = (index % 5) as BingoBoardSize;
      if (columnIndex === 0) {
        acc.push(createNewBingoData());
      }
      const bingoBoard = getLastElement(acc);
      const newBingoBoardRow = line
        .split(/ {1,}/gm)
        .map(toNumber) as BingoBoardRow;
      bingoBoard.board[columnIndex] = newBingoBoardRow;
      newBingoBoardRow.forEach((value, rowIndex) =>
        bingoBoard.lookup.set(value, [columnIndex, rowIndex as BingoBoardSize])
      );

      return acc;
    }, []);
  return [bingoNumbers, bingoData];
}

function createNewBingoBoard(): BingoBoard {
  const emptyRow: BingoBoardRow = [-1, -1, -1, -1, -1];
  const newBingoData: BingoBoard = [
    [...emptyRow],
    [...emptyRow],
    [...emptyRow],
    [...emptyRow],
    [...emptyRow],
  ];
  return newBingoData;
}

function createNewBingoData(): BingoData {
  const newBingoData: BingoData = {
    board: createNewBingoBoard(),
    lookup: new Map(),
  };
  return newBingoData;
}

function getLastElement<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

function toNumber(value: string): number {
  return Number(value);
}

function findWinningBoard(
  bingoNumbers: number[],
  boards: BingoData[]
): BingoDataEvaluatedCompleted | undefined {
  return boards
    .map((board) => evaluateBoard(bingoNumbers, board))
    .filter((x): x is BingoDataEvaluatedCompleted => x.completed)
    .reduce<BingoDataEvaluatedCompleted | undefined>((first, board) => {
      if (!first) {
        return board;
      }
      if (first.indexOfFinalNumber < board.indexOfFinalNumber) {
        return board;
      }

      return first;
    }, undefined);
}

function evaluateBoard(
  bingoNumbers: number[],
  board: BingoData
): BingoDataEvaluated {
  const rowEvaluations: BingoBoardRow = [0, 0, 0, 0, 0];
  const columnEvaluations: BingoBoardRow = [0, 0, 0, 0, 0];
  for (let index = 0; index < bingoNumbers.length; index++) {
    const bingoNumber = bingoNumbers[index];
    const position = board.lookup.get(bingoNumber);
    if (!position) {
      continue;
    }
    const [columnIndex, rowIndex] = position;

    rowEvaluations[rowIndex] |= 1 << columnIndex;
    columnEvaluations[columnIndex] |= 1 << rowIndex;

    if (rowEvaluations.includes(31) || columnEvaluations.includes(31)) {
      return {
        ...board,
        completed: true,
        finalNumber: bingoNumber,
        indexOfFinalNumber: index,
        marks: columnEvaluations,
      };
    }
  }
  return {
    ...board,
    completed: false,
  };
}

function calculateResult(board: BingoDataEvaluatedCompleted): number {
  let sum = 0;
  for (let columnIndex = 0; columnIndex < 5; columnIndex++) {
    const columnMarks = board.marks[columnIndex];
    for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
      if ((columnMarks & (1 << rowIndex)) !== 0) {
        continue;
      }
      const value = board.board[columnIndex][rowIndex];
      sum += value;
      console.log({ sum, value, rowIndex, columnIndex });
    }
  }
  console.log(board);
  return sum * board.finalNumber;
}
