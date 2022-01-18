import kaboom from "kaboom";
import { useRef, useEffect } from "react";

const Breakout = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const k = kaboom({
            //if you don't want to import to the global namespace
            global: false,
            //if you don't want kaboom to create a canvas and insert under document.body
            canvas: canvasRef.current,
            background: [0, 128, 0],

        });

        k.loadSound("explode", "/audio/snake/explode.mp3");
        k.loadSound("score", "/audio/score.mp3");

        // Adjust global volume
        k.volume(0.5)

        let score = 0;
        const bricks_row = 14;
        const rows = 6;
        let level = 1;
        const total_levels = 2;

        k.add([
            k.pos(k.width() / 2, k.height() - 100),
            k.rect(80, 20),
            k.outline(4),
            k.origin("center"),
            k.area(),
            "paddle",
        ])

        // move paddles with mouse
        k.onUpdate("paddle", (p) => {
            p.pos.x = k.mousePos().x;
            if (k.mousePos().y < k.height() - 100) {
                p.pos.y = k.mousePos().y
            }

        })

        let speed = 320

        const ball = k.add([
            k.pos(k.center()),
            k.circle(12),
            k.outline(4),
            k.area({ width: 32, height: 32, offset: k.vec2(-12) }),
            { vel: k.dir(90) },
        ])

        let startGame = false;
        // move ball
        ball.onUpdate(() => {
            if (startGame) {
                ball.move(ball.vel.scale(speed))
                if (ball.pos.y > k.height() - 10) {
                    score = 0
                    ball.pos = k.center()
                    ball.vel = k.dir(90)
                    speed = 320;
                    k.play("explode");
                    spawnBricks();

                }
                if (ball.pos.x < 10 || ball.pos.x > k.width() - 10) {
                    ball.vel.x = -ball.vel.x
                }
                if (ball.pos.y < 10) {
                    ball.pos = k.center();
                    ball.vel = k.dir(90);
                    speed = 320;
                    level += 1;
                    if (level <= total_levels) {
                        scoreLabel.text = "Level: " + (level).toString();
                        spawnBricks();
                    }
                    else{
                        scoreLabel.text = "Level: " + (level - 1).toString() + " GAME OVER!";
                        startGame = false;
                    }

                }
            }

        })

        // bounce when touch paddle
        ball.onCollide("paddle", (p) => {
            speed += 1
            ball.vel = k.dir(ball.pos.angle(p.pos))
        });

        ball.onCollide("brick", (b) => {
            speed += 1
            ball.vel = k.dir(ball.pos.angle(b.pos));
            k.play("score");
            k.destroy(b);
        });

        ball.onCollide("block", (b) => {
            speed += 1
            ball.vel = k.dir(ball.pos.angle(b.pos));

        });

        function spawnBricks() {
            k.destroyAll("block");
            k.destroyAll("brick");

            let xPos = 20;
            let yPos = 20;

            for (let j = 0; j < rows; ++j) {
                for (let i = 0; i < bricks_row; ++i) {
                    if (level === 2) {
                        if (j === 4 && i > 6) {
                            k.add([
                                k.pos(xPos + (i * 90), yPos + (j * 50)),
                                k.rect(80, 40),
                                k.outline(4),
                                k.color(255, 0, 0),
                                k.area(),
                                "block",
                            ]);
                            continue;
                        }
                    }

                    if (level === 1) {
                        if (j === 4 && (i > 10 || i < 3)) {
                            k.add([
                                k.pos(xPos + (i * 90), yPos + (j * 50)),
                                k.rect(80, 40),
                                k.outline(4),
                                k.color(255, 0, 0),
                                k.area(),
                                "block",
                            ]);
                            continue;
                        }
                    }

                    k.add([
                        k.pos(xPos + (i * 90), yPos + (j * 50)),
                        k.rect(80, 40),
                        k.outline(4),
                        k.area(),
                        "brick",
                    ]);
                }
            }

            startGame = true;
        }

        function addButton(txt, p, f) {

            const btn = k.add([
                k.text(txt, { size: 32 }),
                k.pos(p),
                k.area({ cursor: "pointer", }),
                k.scale(1),
                k.origin("center"),
            ])

            btn.onClick(f)

            btn.onUpdate(() => {
                if (btn.isHovering()) {
                    const t = k.time() * 10
                    btn.color = k.rgb(
                        k.wave(0, 255, t),
                        k.wave(0, 255, t + 2),
                        k.wave(0, 255, t + 4),
                    )
                    btn.scale = k.vec2(1.2)
                } else {
                    btn.scale = k.vec2(1)
                    btn.color = k.rgb()
                }
            })

        }

        addButton("Start", k.vec2(k.width() / 2, k.height() - 40), () => {
            level = 1;
            scoreLabel.text = "Level: " + (level).toString();
            spawnBricks();
        });

        const scoreLabel = k.add([
            k.text("Level: " + (level).toString(), {
                size: 32
            }),
            k.pos((k.width() / 2) + 100, k.height() - 55)
        ]);

    }, []);

    return <div className="board"><canvas ref={canvasRef}></canvas></div>
};

export default Breakout;