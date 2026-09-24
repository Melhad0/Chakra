export type LogicalTickHandler = (dt: number) => void;
export type RenderFrameHandler = (dt: number) => void;

export class GameEngineLoop {
  private isRunning = false;
  private lastTimestamp = 0;
  private accumulator = 0;
  private animFrameId: number | null = null;

  // 20 ticks lógicos fixos por segundo (50ms por tick)
  private readonly TICK_RATE_MS = 1000 / 20;
  private readonly TICK_RATE_SEC = 1 / 20;

  private onTick: LogicalTickHandler | null = null;
  private onRender: RenderFrameHandler | null = null;

  public setHandlers(onTick: LogicalTickHandler, onRender?: RenderFrameHandler): void {
    this.onTick = onTick;
    this.onRender = onRender || null;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.accumulator = 0;
    this.loop = this.loop.bind(this);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loop(currentTime: number): void {
    if (!this.isRunning) return;

    let deltaMs = currentTime - this.lastTimestamp;
    this.lastTimestamp = currentTime;

    // Evita espiral de morte em caso de suspensão de aba
    if (deltaMs > 1000) {
      deltaMs = 1000;
    }

    this.accumulator += deltaMs;

    // Executa ticks lógicos em passos fixos determinísticos
    while (this.accumulator >= this.TICK_RATE_MS) {
      if (this.onTick) {
        this.onTick(this.TICK_RATE_SEC);
      }
      this.accumulator -= this.TICK_RATE_MS;
    }

    // Callback de renderização visual (60 FPS)
    if (this.onRender) {
      this.onRender(deltaMs / 1000);
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  }
}

export const gameLoop = new GameEngineLoop();
