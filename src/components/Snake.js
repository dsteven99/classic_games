import kaboom from "kaboom";
import { useRef, useEffect } from "react";

const Snake = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const k = kaboom({
            //if you don't want to import to the global namespace
            global: false,
            //if you don't want kaboom to create a canvas and insert under document.body
            canvas: canvasRef.current,
            scale: 2,

        });

        k.loadSound("other-worldly-foe", "/audio/snake/otherworldlyfoe.mp3");
        k.loadSound("burp", "/audio/snake/burp.mp3");
        k.loadSound("powerup", "/audio/snake/powerup.mp3");
        k.loadSound("explode", "/audio/snake/explode.mp3");

        const music = k.play("other-worldly-foe", {
            loop: true,
        });

        // Adjust global volume
        k.volume(0.5)

        k.loadSprite("pizza", "images/snake/pizza.png");
        k.loadSprite("background", "images/snake/background.png");
        k.loadSprite("fence-top", "images/snake/fence-top.png");
        k.loadSprite("fence-bottom", "images/snake/fence-bottom.png");
        k.loadSprite("fence-left", "images/snake/fence-left.png");
        k.loadSprite("fence-right", "images/snake/fence-right.png");
        k.loadSprite("post-top-left", "images/snake/post-top-left.png");
        k.loadSprite("post-top-right", "images/snake/post-top-right.png");
        k.loadSprite("post-bottom-left", "images/snake/post-bottom-left.png");
        k.loadSprite("post-bottom-right", "images/snake/post-bottom-right.png");
        k.loadSprite("snake-skin", "images/snake/snake-skin.png");

        k.layers(
            [
                "background",
                "game"
            ], "game"
        );

        k.add([
            k.sprite("background"),
            k.layer("background")
        ]);

        const directions = {
            UP: "up",
            DOWN: "down",
            LEFT: "left",
            RIGHT: "right",
        };

        let current_direction = directions.RIGHT;
        let run_action = false;
        let snake_length = 3;

        let snake_body = [];

        const block_size = 20;

        k.addLevel([
            "1tttttttttttt2",
            "l            r ",
            "l            r ",
            "l            r ",
            "l            r ",
            "l            r ",
            "l            r ",
            "l            r ",
            "l            r ",
            "l            r ",
            "l            r ",
            "l            r ",
            "l            r ",
            "3bbbbbbbbbbbb4",
        ], {
            width: block_size,
            height: block_size,
            pos: k.vec2(0, 0),
            "t": () => [
                k.sprite("fence-top"),
                k.area(),
                "wall"
            ],
            "b": () => [
                k.sprite("fence-bottom"),
                k.area(),
                "wall"
            ],
            "l": () => [
                k.sprite("fence-left"),
                k.area(),
                "wall"
            ],
            "r": () => [
                k.sprite("fence-right"),
                k.area(),
                "wall"
            ],
            "1": () => [
                k.sprite("post-top-left"),
                k.area(),
                "wall"
            ],
            "2": () => [
                k.sprite("post-top-right"),
                k.area(),
                "wall"
            ],
            "3": () => [
                k.sprite("post-bottom-left"),
                k.area(),
                "wall"
            ],
            "4": () => [
                k.sprite("post-bottom-right"),
                k.area(),
                "wall"
            ],
        });

        function respawn_snake() {
            snake_body.forEach(segment => {
                k.destroy(segment);
            });
            snake_body = [];
            snake_length = 3;

            for (let i = 1; i <= snake_length; i++) {
                snake_body.push(k.add([
                    k.sprite('snake-skin'),
                    k.pos(block_size, block_size * i),
                    k.area(),
                    "snake"
                ]));
            }
            current_direction = directions.RIGHT;
        }

        function respawn_all() {
            run_action = false;
            k.wait(0.5, function () {
                respawn_snake();
                respawn_food();
                run_action = true;
                scoreLabel.text = "Score: " + (snake_length - 3).toString();
                k.play("powerup");
                music.play();
            });
        }

        k.onKeyPress("up", () => {
            if (current_direction !== directions.DOWN) {
                current_direction = directions.UP;
            }
        });

        k.onKeyPress("down", () => {
            if (current_direction !== directions.UP) {
                current_direction = directions.DOWN;
            }
        });

        k.onKeyPress("left", () => {
            if (current_direction !== directions.RIGHT) {
                current_direction = directions.LEFT;
            }
        });

        k.onKeyPress("right", () => {
            if (current_direction !== directions.LEFT) {
                current_direction = directions.RIGHT;
            }
        });

        let move_delay = 0.2;
        let timer = 0;

        k.onUpdate(() => {
            if (!run_action) {
                return;
            }

            timer += k.dt();
            if (timer < move_delay) {
                return;
            }
            timer = 0;

            let move_x = 0;
            let move_y = 0;

            switch (current_direction) {
                case directions.DOWN:
                    move_x = 0;
                    move_y = block_size;
                    break;
                case directions.UP:
                    move_x = 0;
                    move_y = -1 * block_size;
                    break;
                case directions.LEFT:
                    move_x = -1 * block_size;
                    move_y = 0;
                    break;
                case directions.RIGHT:
                    move_x = block_size;
                    move_y = 0;
                    break;
                default:
                    break;
            }

            let snake_head = snake_body[snake_body.length - 1];

            snake_body.push(k.add([
                k.sprite('snake-skin'),
                k.pos(snake_head.pos.x + move_x, snake_head.pos.y + move_y),
                k.area(),
                "snake",
            ]));

            if (snake_body.length > snake_length) {
                let tail = snake_body.shift();
                k.destroy(tail);
            }

        });

        let food = null;

        function respawn_food() {
            let new_pos = k.rand(k.vec2(1, 1), k.vec2(13, 13));
            new_pos.x = Math.floor(new_pos.x);
            new_pos.y = Math.floor(new_pos.y);
            new_pos = new_pos.scale(block_size);

            if (food) {
                k.destroy(food);
            }
            food = k.add([
                k.sprite('pizza'),
                k.pos(new_pos),
                k.area(),
                "food"
            ]);
        }

        k.onCollide("snake", "food", (s, f) => {
            k.play("burp");
            snake_length++;
            scoreLabel.text = "Score: " + (snake_length - 3).toString();
            respawn_food();
        });

        k.onCollide("snake", "wall", (s, w) => {
            run_action = false;
            k.play("explode");
            k.shake(12);
            music.pause();
            //respawn_all();
        });

        k.onCollide("snake", "snake", (s, t) => {
            run_action = false;
            k.play("explode");
            k.shake(12);
            music.pause();
            //respawn_all();
        });

        //respawn_all();

        function addButton(txt, p, f) {

            const btn = k.add([
                k.text(txt, { size: 32}),
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

        addButton("Start", k.vec2(375, 100), () => respawn_all());

        k.add([
            k.text("Snake", {
                size: 48,
                transform: (idx, ch) => ({
                    color: k.hsl2rgb((k.time() * 0.2 + idx * 0.1) % 1, 0.7, 0.8),
                    pos: k.vec2(0, k.wave(-4, 4, k.time() * 4 + idx * 0.5)),
                    scale: k.wave(1, 1.2, k.time() * 3 + idx),
                    angle: k.wave(-9, 9, k.time() * 3 + idx),
                }),
            }),
            k.pos(300, 10),
        ]);

        const scoreLabel = k.add([
            k.text("Score: " + (snake_length - 3).toString(), {
                size: 32
            }),
            k.pos(325,150)
        ]);


    }, []);

    return <div class="board"><canvas ref={canvasRef}></canvas></div>
};

export default Snake;