import { GoString } from "./goboard_slow";
import { PLAYER_BLACK, Point } from "./gotypes";

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
