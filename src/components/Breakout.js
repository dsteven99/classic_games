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
        k.loadSound("signal", "/audio/signal.mp3");

        // Adjust global volume
        k.volume(0.5)

        let score = 0;
        let levelHits = 0;
        const bricks_row = 14;
        const rows = 6;
        let level = 1;
        const total_levels = 3;
        let numOfBalls = 3;

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
                    score -= levelHits;
                    scoreLabel.text = "Score: " + score.toString();
                    levelHits = 0;
                    ball.pos = k.center()
                    ball.vel = k.dir(90)
                    k.play("explode");

                    numOfBalls -= 1;

                    if(numOfBalls === 0){
                        startGame = false;
                        gameOver.text = "Game Over!";
                        k.play("signal");
                    }
                    else{
                        spawnBricks();
                    }
                    

                }
                if (ball.pos.x < 10 || ball.pos.x > k.width() - 10) {
                    ball.vel.x = -ball.vel.x
                }
                if (ball.pos.y < 10) {
                    ball.pos = k.center();
                    ball.vel = k.dir(90);
                    level += 1;
                    if (level <= total_levels) {
                        levelLabel.text = "Level: " + (level).toString();
                        spawnBricks();
                    }
                    else {
                        levelLabel.text = "Level: " + (level - 1).toString();
                        gameOver.text = "Game Over!";
                        k.play("signal");
                    }
                    startGame = false;
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
            score += 1;
            levelHits += 1;
            scoreLabel.text = "Score: " + score.toString();
            k.destroy(b);
        });

        ball.onCollide("block", (b) => {
            speed += 1
            ball.vel = k.dir(ball.pos.angle(b.pos));

        });

        function spawnBricks() {
            k.destroyAll("block");
            k.destroyAll("brick");
            levelHits = 0;
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

                    if (level === 3) {
                        if (j === 4 && (i > 10 || i < 3 || i === 5 || i === 6 || i === 7)) {
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
            if (level === 1 || level > total_levels) {
                level = 1;
                score = 0;
                levelHits = 0;
                levelLabel.text = "Level: " + (level).toString();
                scoreLabel.text = "Score: 0";
                gameOver.text = "";
                numOfBalls = 3;
            }
            speed = 320;
            spawnBricks();
        });

        const levelLabel = k.add([
            k.text("Level: " + (level).toString(), {
                size: 32
            }),
            k.pos((k.width() / 2) + 400, k.height() - 55)
        ]);

        const gameOver = k.add([
            k.text("", {
                size: 32,
            }),
            k.pos(k.center().x - 100, k.center().y + 100)
        ]);

        const scoreLabel = k.add([
            k.text("Score : 0", {
                size: 32
            }),
            k.pos((k.width() / 2) + 150, k.height() - 55)
        ]);

    }, []);

    return <div className="board"><canvas ref={canvasRef}></canvas></div>
};

export default Breakout;