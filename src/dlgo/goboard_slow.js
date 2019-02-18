import _ from "lodash";
import { PLAYER_BLACK, Point } from "./gotypes";

export class IllegalMoveError extends Error {}

const cmp = ({ row, col }, other) => row === other.row && col === other.col;

export class GoString {
  constructor(color, stones, liberties) {
    this.color = color;
    this.stones = _.uniq(stones || []);
    this.liberties = _.uniq(liberties || []);
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

export class Board {
  constructor(num_rows, num_cols) {
    this.num_rows = num_rows;
    this.num_cols = num_cols;
    this._grid = {};
  }

  place_stone = (player, point) => {
    if (!this.is_on_grid(point)) {
      throw new Error("Invalid point");
    }
    if (!_.isUndefined(this._grid[point])) {
      throw new Error("Cannot place on occupied point");
    }
    let adjacent_same_color = [];
    let adjacent_opposite_color = [];
    let liberties = [];

    point
      .neighbors()
      .filter(this.is_on_grid)
      .forEach(neighbor => {
        const neighbor_string = this._grid[neighbor];
        if (_.isUndefined(neighbor_string)) {
          liberties.push(neighbor);
        } else if (neighbor_string.color === player) {
          adjacent_same_color = _.uniq([
            ...adjacent_same_color,
            neighbor_string
          ]);
        } else {
          adjacent_opposite_color = _.uniq([
            ...adjacent_opposite_color,
            neighbor_string
          ]);
        }
      });

    let new_string = new GoString(player, [point], liberties);

    adjacent_same_color.forEach(same_color_string => {
      new_string = new_string.merged_with(same_color_string);
    });

    new_string.stones.forEach(new_string_point => {
      this._grid[new_string_point] = new_string;
    });

    adjacent_opposite_color.forEach(other_color_string => {
      other_color_string.remove_liberty(point);
    });

    adjacent_opposite_color.forEach(other_color_string => {
      if (other_color_string.liberties === 0) {
        this._remove_string(other_color_string);
      }
    });
  };

  _remove_string = string => {
    string.stones
      .map(point => point.neighbors())
      .map(neighbor => this._grid[neighbor])
      .filter(_compose(_.isNil, _.isString))
      .forEach(() => {
        this._grid[neighbor].add_liberty(point);
      });

    string.stones.foreach(point => delete this._grid[point]);
  };

  is_on_grid = point => {
    return (
      point.row >= 1 &&
      point.row <= this.num_rows &&
      point.col >= 1 &&
      point.col <= this.num_cols
    );
  };

  get = point => {
    const string = this._grid[point];
    if (_.isUndefined(string)) {
      return undefined;
    }
    return string.color;
  };

  get_go_string = point => {
    const string = this._grid[point];
    if (_.isUndefined(string)) {
      return undefined;
    }
    return string;
  };
}

export class Move {
  constructor(point = undefined, is_pass = false, is_resign = false) {
    this.point = point;
    this.is_play = this.point !== undefined;
    this.is_pass = is_pass;
    this.is_resign = is_resign;
  }
}

export function play(point) {
  return new Move(point);
}

export function pass_turn() {
  return new Move(undefined, true);
}

export function resign() {
  return new Move(undefined, false, true);
}

export class GameState {
  constructor(board, next_player, previous, move) {
    this.board = board;
    this.next_player = next_player;
    this.previous_state = previous;
    this.last_move = move;
  }

  apply_move = move => {
    if (move.is_play) {
      next_board = _.cloneDeep(this.board);
      next_board.place_stone(this.next_player, move.point);
    } else {
      next_board = this.board;
    }
    return GameState(next_board, other(this.next_player), this, move);
  };

  is_move_self_capture = (player, move) => {
    if (!move.is_play) {
      return false;
    }
    let next_board = _.cloneDeep(this.board);
    next_board.place_stone(player, move.point);
    const new_string = next_board.get_go_string(move.point);
    return new_string.num_liberties() === 0;
  };

  situation = () => [this.next_player, this.board];

  does_move_violate_ko = (player, move) => {
    if (!move.is_play) {
      return false;
    }
    let next_board = _.cloneDeep(this.board);
    next_board.place_stone(player, move.point);
    const next_situation = [other(player), next_board];
    let past_state = this.previous_state;
    while (past_state !== undefined) {
      if (past_state.situation() === next_situation) {
        return true;
      }
      past_state = past_state.previous_state;
    }
    return false;
  };

  is_valid_move = move => {
    if (this.is_over()) {
      return false;
    } else if (move.is_pass || move.is_resign) {
      return true;
    }

    return (
      this.board.get(move.point) === undefined &&
      !this.is_move_self_capture(this.next_player, move) &&
      !this.does_move_violate_ko(this.next_player, move)
    );
  };

  is_over = () => {
    if (this.last_move === undefined) {
      return false;
    }
    if (this.last_move.is_resign) {
      return true;
    }
    const second_last_move = this.previous_state.last_move;
    if (second_last_move === undefined) {
      return false;
    }
    return this.last_move.is_pass && second_last_move.is_pass;
  };

  legal_moves = () => {
    let moves = [];
    for (let row = 1; row < this.board.num_rows + 1; row++) {
      for (let col = 1; col < this.board.num_cols + 1; col++) {
        const move = play(new Point(row, col));
        if (this.is_valid_move(move)) {
          moves.push(move);
        }
      }
    }

    moves.push(pass_turn());
    moves.push(resign());

    return moves;
  };

  winner = () => {
    if (!this.is_over()) {
      return undefined;
    }
    if (this.last_move.is_resign) {
      return self.next_player;
    }
    const game_result = compute_game_result(this);
    return game_result.winner;
  };
}

export function new_game(board_size) {
  if (!_.isInteger(board_size)) {
    throw new Error("Invalid board size.");
  }
  const board = new Board(board_size, board_size);
  return new GameState(board, PLAYER_BLACK, undefined, undefined);
}
