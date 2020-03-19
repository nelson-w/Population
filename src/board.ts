import Game from "./game";
import Person from "./person";
import Tile from "./tile";
import Util from "./util";

export default class Board {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private map: (Tile)[][];
  private height: number;
  private width: number;
  private coloniesNumber: number;
  private game: Game;

  constructor(game: Game, canvas: HTMLCanvasElement, coloniesNumber: number) {
    this.coloniesNumber = coloniesNumber;
    this.game = game;
    this.canvas = canvas;
    this.height = canvas.height;
    this.width = canvas.width;
    this.context = canvas.getContext("2d");
    const imageData = this.context.getImageData(0, 0, this.width, this.height)
      .data;

    this.map = [];
    for (let i = 0; i < this.width; i++) {
      this.map[i] = [];
    }
    for (let i = 0; i < imageData.length; i += 4) {
      const color: string =
        "#" +
        Util.int2hex(imageData[i]) +
        Util.int2hex(imageData[i + 1]) +
        Util.int2hex(imageData[i + 2]);
      if (color === this.game.getColour(this.game.GRASS_COLOUR)) {
        const x = (i / 4) % this.width;
        const y = Math.floor(i / 4 / this.width);
        this.map[x][y] = this.game.GRASS_TILE;
      }
      if (color === this.game.getColour(this.game.WATER_COLOUR)) {
        const x = (i / 4) % this.width;
        const y = Math.floor(i / 4 / this.width);
        this.map[x][y] = this.game.WATER_TILE;
      }
    }
    this.createColonies();
  }

  // Check whether x and y are in board's bounds.
  public isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  // Returns object at (x, y).
  public getObj(x: number, y: number): Tile {
    if (this.isInBounds(x, y)) {
      return this.map[x][y];
    }
    return null;
  }

  // Sets object at (x, y).
  public setObj(x: number, y: number, obj: Tile): void {
    this.map[x][y] = obj;
    this.context.fillStyle = this.game.getColour(obj.colour);
    this.context.fillRect(x, y, 1, 1);
  }

  // Kills Person at position.
  public killPerson(x: number, y: number, killer: Person): void {
    (this.map[x][y] as Person).kill();
    this.setObj(x, y, killer);
  }

  // Create colonies.
  public createColonies(): void {
    let x;
    let y;
    const offset = 10;
    let x2;
    let y2;
    let test;
    for (let i: number = 0; i < this.coloniesNumber; i++) {
      while (true) {
        x = Util.randomInt(0, this.width - 1);
        y = Util.randomInt(0, this.height - 1);
        if (this.map[x][y].colour === this.game.GRASS_COLOUR) {
          break;
        }
      }
      for (let j: number = 0; j < 50; j++) {
        test = 0;
        while (true) {
          test += 1;
          do {
            test += 0.01;
            x2 = x + Util.randomInt(0, offset);
            y2 = y + Util.randomInt(0, offset);
          } while (!this.isInBounds(x2, y2));
          if (test >= 50) {
            break;
          }
          if (this.map[x2][y2].colour === this.game.GRASS_COLOUR) {
            this.setObj(
              x2,
              y2,
              new Person(
                this.game,
                this,
                x2,
                y2,
                0,
                Util.randomInt(0, 100),
                i,
                Util.randomInt(0, 100),
              ),
            );
            break;
          }
        }
      }
    }
  }
}
