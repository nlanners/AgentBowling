export interface Frame {
  rolls: number[];
  isSpare: boolean;
  isStrike: boolean;
  score: number;
}

export class BowlingGame {
  private frames: Frame[];
  private currentFrame: number;
  private currentRoll: number;

  constructor() {
    this.frames = Array(10)
      .fill(null)
      .map(() => ({
        rolls: [],
        isSpare: false,
        isStrike: false,
        score: 0,
      }));
    this.currentFrame = 0;
    this.currentRoll = 0;
  }

  public roll(pins: number): void {
    if (this.isGameOver()) {
      return;
    }

    const frame = this.frames[this.currentFrame];
    frame.rolls.push(pins);

    // Check for strike
    if (this.currentRoll === 0 && pins === 10) {
      frame.isStrike = true;
      this.moveToNextFrame();
    }
    // Check for spare
    else if (this.currentRoll === 1) {
      if (frame.rolls[0] + pins === 10) {
        frame.isSpare = true;
      }
      this.moveToNextFrame();
    } else {
      this.currentRoll++;
    }

    // Special case for 10th frame
    if (this.currentFrame === 9) {
      if (frame.isStrike || frame.isSpare) {
        // We get extra rolls in the 10th frame
        if (frame.rolls.length >= 3) {
          this.currentFrame++;
        }
      } else if (frame.rolls.length >= 2) {
        this.currentFrame++;
      }
    }

    this.calculateScore();
  }

  private moveToNextFrame(): void {
    this.currentFrame++;
    this.currentRoll = 0;
  }

  private calculateScore(): void {
    let score = 0;

    for (let frameIndex = 0; frameIndex < this.frames.length; frameIndex++) {
      const frame = this.frames[frameIndex];

      // Add the pins from this frame
      for (const pins of frame.rolls) {
        score += pins;
      }

      // Add bonus for spares
      if (frame.isSpare && frameIndex < 9) {
        const nextFrame = this.frames[frameIndex + 1];
        if (nextFrame.rolls.length > 0) {
          score += nextFrame.rolls[0];
        }
      }

      // Add bonus for strikes
      if (frame.isStrike && frameIndex < 9) {
        const nextFrame = this.frames[frameIndex + 1];
        if (nextFrame.rolls.length > 0) {
          score += nextFrame.rolls[0];

          if (nextFrame.rolls.length > 1) {
            score += nextFrame.rolls[1];
          } else if (nextFrame.isStrike && frameIndex < 8) {
            const afterNextFrame = this.frames[frameIndex + 2];
            if (afterNextFrame.rolls.length > 0) {
              score += afterNextFrame.rolls[0];
            }
          }
        }
      }

      frame.score = score;
    }
  }

  public getFrames(): Frame[] {
    return this.frames;
  }

  public getCurrentFrame(): number {
    return this.currentFrame;
  }

  public getCurrentRoll(): number {
    return this.currentRoll;
  }

  public getTotalScore(): number {
    const lastFrame = this.frames[this.frames.length - 1];
    return lastFrame.score;
  }

  public isGameOver(): boolean {
    return this.currentFrame >= 10;
  }

  public reset(): void {
    this.frames = Array(10)
      .fill(null)
      .map(() => ({
        rolls: [],
        isSpare: false,
        isStrike: false,
        score: 0,
      }));
    this.currentFrame = 0;
    this.currentRoll = 0;
  }
}
