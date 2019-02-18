import _ from "lodash";

export class IllegalMoveError extends Error {}

const cmp = ({ row, col }, other) => row === other.row && col === other.col;

export class GoString {
  constructor(color, stones, liberties) {
    this.color = color;
    this.stones = stones || [];
    this.liberties = liberties || [];
  }

  remove_liberty = point => {
    this.liberties = _.filter(this.liberties, _.isEqual(point));
  };

  add_liberty = point => {
    this.liberties = _.unionWith([...this.liberties], [point], cmp);
  };

  merged_with = go_string => {
    if (go_string.color !== this.color) {
      throw new Error("Cannot merge different colors");
    }

    const combined_stones = _.unionWith(this.stones, go_string.stones, cmp);
    const new_liberties = _.differenceWith(
      _.unionWith(this.liberties, go_string.liberties, cmp),
      combined_stones,
      cmp
    );
    return new GoString(this.color, combined_stones, new_liberties);
  };

  num_liberties = () => {
    this.liberties.length;
  };
}

class Board {
  constructor(num_rows, num_cols) {
    this.num_rows = num_rows;
    this.num_cols = num_cols;
    this._grid = {};
  }
}
