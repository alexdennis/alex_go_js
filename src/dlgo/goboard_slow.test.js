import { GoString, Board, new_game } from "./goboard_slow";
import { PLAYER_BLACK, PLAYER_WHITE, Point } from "./gotypes";

describe("GoString", () => {
  test("remove liberties", () => {
    const stones = [new Point(0, 0)];
    const liberties = [new Point(3, 4)];
    const go_string = new GoString(PLAYER_BLACK, stones, liberties);

    expect(go_string.liberties).toEqual(liberties);

    go_string.remove_liberty(liberties[0]);

    expect(go_string.liberties.length).toBe(0);
  });

  test("add liberties", () => {
    const go_string = new GoString(PLAYER_BLACK);

    expect(go_string.liberties).toHaveLength(0);

    go_string.add_liberty(new Point(5, 6));

    expect(go_string.liberties).toHaveLength(1);
  });

  test("merge strings", () => {
    const go_string_1 = new GoString(
      PLAYER_BLACK,
      [new Point(5, 7)],
      new Point(5, 7).neighbors()
    );
    const go_string_2 = new GoString(
      PLAYER_BLACK,
      [new Point(5, 6)],
      new Point(5, 6).neighbors()
    );

    const merged_string = go_string_1.merged_with(go_string_2);
    expect(merged_string.stones).toHaveLength(2);
  });
});

describe("Board", () => {
  test("place stone", () => {
    const board = new Board(9, 9);
    expect(board.num_cols).toBe(9);
    expect(board.num_rows).toBe(9);

    board.place_stone(PLAYER_BLACK, new Point(4, 4));
    board.place_stone(PLAYER_WHITE, new Point(4, 6));
  });
});

describe("GameState", () => {
  test("new game", () => {
    const game = new_game(9);
    console.log(game.legal_moves());
  });
});
