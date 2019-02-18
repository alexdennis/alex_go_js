import { other, PLAYER_BLACK, PLAYER_WHITE, Point } from "./gotypes";

test("other give me the other player", () => {
  expect(other(PLAYER_BLACK)).toBe(PLAYER_WHITE);
  expect(other(PLAYER_WHITE)).toBe(PLAYER_BLACK);
});

describe("Point", () => {
  test("constructs", () => {
    const point = new Point(0, 0);
    expect(point.col).toBe(0);
    expect(point.row).toBe(0);
  });

  test("can tell its neighbors", () => {
    const point = new Point(3, 4);
    expect(point.neighbors()).toMatchSnapshot();
  });
});
