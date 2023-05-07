export class Stopwatch {
  private startedAt: number;
  private pausedAt?: number;

  constructor(private getTime = () => new Date().getTime()) {
    this.startedAt = this.now;
  }

  private get now() {
    return this.getTime();
  }

  get elapsed() {
    if (this.pausedAt !== undefined) {
      return this.pausedAt - this.startedAt;
    }

    return this.now - this.startedAt;
  }

  get paused() {
    return this.pausedAt !== undefined;
  }

  pause() {
    this.pausedAt = this.now;
  }

  unpause() {
    if (this.pausedAt === undefined) {
      return;
    }

    this.startedAt += this.now - this.pausedAt;
    this.pausedAt = undefined;
  }

  restart() {
    this.startedAt = this.now;
    this.pausedAt = undefined;
  }
}
