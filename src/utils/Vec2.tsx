export default class Vec2 {
  constructor(
    public x: number,
    public y: number,
  ) {
    this.x = x;
    this.y = y;
  }
  add(vector: Vec2) {
    return new Vec2(this.x + vector.x, this.y + vector.y);
  }
  sub(vector: Vec2) {
    return new Vec2(this.x - vector.x, this.y - vector.y);
  }
  mult(scalar: number) {
    return new Vec2(this.x * scalar, this.y * scalar);
  }
  div(scalar: number) {
    return new Vec2(this.x / scalar, this.y / scalar);
  }
}
