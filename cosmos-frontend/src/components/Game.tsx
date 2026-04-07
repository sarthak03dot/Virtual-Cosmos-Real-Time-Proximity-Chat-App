import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { socket } from "../socket";
import ChatBox from "./ChatBox";

interface Position {
  x: number;
  y: number;
}

const RADIUS = 100;

const Game = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Position>({ x: 400, y: 300 });
  const usersRef = useRef<Record<string, PIXI.Container>>({});

  useEffect(() => {
    let app: PIXI.Application;

    const initPixi = async () => {
      app = new PIXI.Application();

      await app.init({
        width: 800,
        height: 600,
        background: "#020205",
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (containerRef.current) {
        containerRef.current.appendChild(app.canvas);
      }

      // --- LAYER 1: GRID & BACKGROUND ---
      const gridContainer = new PIXI.Container();
      const grid = new PIXI.Graphics();
      grid.lineStyle(1, 0x00ff88, 0.05);

      const gridSize = 40;
      for (let i = 0; i < 1600; i += gridSize) {
        grid.moveTo(i, 0);
        grid.lineTo(i, 1200);
        grid.moveTo(0, i);
        grid.lineTo(1600, i);
      }
      gridContainer.addChild(grid);
      app.stage.addChild(gridContainer);

      // --- LAYER 2: TWINKLING STARS ---
      const starContainer = new PIXI.Container();
      const stars: { sprite: PIXI.Graphics, originalAlpha: number, speed: number }[] = [];

      for (let i = 0; i < 50; i++) {
        const star = new PIXI.Graphics();
        const size = Math.random() * 1.5;
        star.beginFill(0xffffff, Math.random() * 0.5 + 0.3);
        star.drawCircle(0, 0, size);
        star.endFill();
        star.x = Math.random() * 800;
        star.y = Math.random() * 600;
        starContainer.addChild(star);
        stars.push({
          sprite: star,
          originalAlpha: star.alpha,
          speed: Math.random() * 0.05 + 0.01
        });
      }
      app.stage.addChild(starContainer);

      // --- USER CONTAINER FACTORY ---
      const updateOrCreateUser = (id: string, pos: Position) => {
        let container = usersRef.current[id];

        if (!container) {
          container = new PIXI.Container();

          // Radar Pulse Effect
          const pulse = new PIXI.Graphics();
          pulse.lineStyle(2, 0x00ff88, 0.4);
          pulse.drawCircle(0, 0, 10);
          pulse.name = "pulse";

          // Enhanced Glow
          const glow = new PIXI.Graphics();
          glow.beginFill(0x00ff88, 0.1);
          glow.drawCircle(0, 0, 20);
          glow.endFill();

          // Main Dot
          const core = new PIXI.Graphics();
          core.beginFill(0x00ff88);
          core.drawCircle(0, 0, 5);
          core.endFill();

          // Inner Brightness
          const innerCore = new PIXI.Graphics();
          innerCore.beginFill(0xffffff, 0.8);
          innerCore.drawCircle(0, 0, 2);
          innerCore.endFill();

          // Target Crosshair
          const cross = new PIXI.Graphics();
          cross.lineStyle(1, 0x00ffff, 0.5);
          cross.moveTo(-15, 0); cross.lineTo(15, 0);
          cross.moveTo(0, -15); cross.lineTo(0, 15);
          cross.drawCircle(0, 0, 15);

          // Radar Line
          const radarLine = new PIXI.Graphics();
          radarLine.name = "radar";
          radarLine.lineStyle(1.5, 0x00ffff, 0.6);
          radarLine.moveTo(0, 0);
          radarLine.lineTo(RADIUS, 0);

          // Range Ring
          const range = new PIXI.Graphics();
          range.lineStyle(1, 0x00ffff, 0.15);
          range.drawCircle(0, 0, RADIUS);

          container.addChild(range, pulse, glow, cross, radarLine, core, innerCore);
          app.stage.addChild(container);
          usersRef.current[id] = container;
        }

        container.x = pos.x;
        container.y = pos.y;
      };

      socket.emit("move", playerRef.current);
      socket.on("connected", ({ roomId }) => {
        console.log("Connected to room:", roomId);
        setRoomId(roomId);
      });

      socket.on("disconnected", () => {
        console.log("Disconnected");
        setRoomId(null);
      });
      socket.on("users_update", (users: Record<string, Position>) => {
        const currentIds = Object.keys(users);
        const existingIds = Object.keys(usersRef.current);

        existingIds.forEach(id => {
          if (!currentIds.includes(id)) {
            const container = usersRef.current[id];
            app.stage.removeChild(container);
            container.destroy({ children: true, texture: true, textureSource: true, context: true });
            delete usersRef.current[id];
          }
        });

        Object.entries(users).forEach(([id, pos]) => {
          updateOrCreateUser(id, pos);
        });
      });

      // --- ANIMATION LOOP ---
      let time = 0;
      app.ticker.add((ticker) => {
        time += ticker.deltaTime;
        const delta = ticker.deltaTime;

        // Animate Grid for "illusion of movement" if needed
        // gridContainer.x = (gridContainer.x - 0.2 * delta) % gridSize;
        // gridContainer.y = (gridContainer.y - 0.2 * delta) % gridSize;

        // Twinkle stars
        stars.forEach(s => {
          s.sprite.alpha = s.originalAlpha + Math.sin(time * s.speed) * 0.3;
        });

        // Update Users
        Object.values(usersRef.current).forEach(container => {
          const radar = container.getChildByName("radar") as PIXI.Graphics;
          if (radar) radar.rotation += 0.04 * delta;

          const pulse = container.getChildByName("pulse") as PIXI.Graphics;
          if (pulse) {
            pulse.scale.set(1 + (Math.sin(time * 0.05) + 1) * 0.5);
            pulse.alpha = 0.4 - (pulse.scale.x - 1) * 0.2;
          }
        });
      });

      const handleKey = (e: KeyboardEvent) => {
        const speed = 10;
        const p = playerRef.current;
        let moved = false;

        if (e.key === "w") { p.y -= speed; moved = true; }
        if (e.key === "s") { p.y += speed; moved = true; }
        if (e.key === "a") { p.x -= speed; moved = true; }
        if (e.key === "d") { p.x += speed; moved = true; }

        if (moved) {
          // Boundary checks
          p.x = Math.max(0, Math.min(800, p.x));
          p.y = Math.max(0, Math.min(600, p.y));
          socket.emit("move", p);
        }
      };

      window.addEventListener("keydown", handleKey);

      const cleanup = () => {
        window.removeEventListener("keydown", handleKey);
        socket.off("users_update");
        if (app) {
          app.destroy(true, { children: true, texture: true, textureSource: true, context: true });
        }
      };

      (window as any)._pixi_cleanup = cleanup;
    };

    initPixi();

    return () => {
      if ((window as any)._pixi_cleanup) {
        (window as any)._pixi_cleanup();
        delete (window as any)._pixi_cleanup;
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        style={{ width: "800px", height: "600px", overflow: "hidden" }}
      />

      {roomId && <ChatBox roomId={roomId} />}
    </>
  );
};

export default Game;