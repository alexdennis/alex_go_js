export const PLAYER_BLACK = 1;
export const PLAYER_WHITE = 2;

export function other(player) {
  return player === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
}

export class Point {
  constructor(row, col) {
    this.row = row;
    this.col = col;
  }

  neighbors = () => [
    new Point(this.row - 1, this.col),
    new Point(this.row + 1, this.col),
    new Point(this.row, this.col - 1),
    new Point(this.row, this.col + 1)
  ];
}
