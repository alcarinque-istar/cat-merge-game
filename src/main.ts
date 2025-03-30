import Matter from 'matter-js';
import { createWorld } from './world';
// Get both canvases
const container = document.getElementById("simulator-container") as HTMLDivElement;
const bgCanvas = document.getElementById("background") as HTMLCanvasElement;
const canvas = document.getElementById("simulator") as HTMLCanvasElement;

// Set canvas sizes
const width = 400;
const height = 600;
container.style.width = `${width}px`;
container.style.height = `${height}px`;
bgCanvas.width = canvas.width = width;
bgCanvas.height = canvas.height = height;

// Load and tile background image
const bgCtx = bgCanvas.getContext('2d')!;
const bgImage = new Image();
bgImage.src = '../images/background.jpg';

bgImage.onload = () => {
    // Create pattern and fill background
    const pattern = bgCtx.createPattern(bgImage, 'repeat')!;
    bgCtx.fillStyle = pattern;
    bgCtx.fillRect(0, 0, width, height);

    // Start the simulation after image loads
    startSimulation();
};

const startSimulation = () => {
    // Create an engine and a world
    const engine = Matter.Engine.create();
    const world = engine.world;

    // Create a renderer (for debugging purposes)
    const render = Matter.Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: canvas.width,
            height: canvas.height,
            wireframes: false,  // Disable wireframe mode for a solid rendering
            showCollisions: true,
            showBounds: true,
            background: 'transparent',
        }
    });

    // Run the engine and renderer
    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Create ground (for collision)
    createWorld(world, canvas);

    const balls: Matter.Body[] = [];
    // Handle click event to create balls
    canvas.addEventListener("click", (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        console.log('x,y', x, y);

        // Create a new ball with random velocity
        const ball = Matter.Bodies.circle(x, y, 20, {
            restitution: 0.8,  // Bounciness of the ball
            frictionAir: 0.01,  // Small air resistance for natural movement
            render: {
                fillStyle: 'blue',
                sprite: {
                    texture: '../images/cat-1.png',
                    xScale: 0.16,
                    yScale: 0.16,
                    yOffset: 0.1
                }
            },
            label: 'ball-1',
        });

        // Add the ball to the world
        Matter.World.add(world, ball);
        balls.push(ball);
    });

    Matter.Events.on(engine, 'collisionStart', (event) => {
        const pairs = event.pairs;

        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];

            const bodyALabel = pair.bodyA.label?.split('-')[0];
            const bodyANumber = pair.bodyA.label?.split('-')[1];
            const bodyBLabel = pair.bodyB.label?.split('-')[0];
            const bodyBNumber = pair.bodyB.label?.split('-')[1];

            if (bodyANumber === bodyBNumber && bodyALabel === 'ball' && bodyBLabel === 'ball') {
                const ball1 = pair.bodyA;
                const ball2 = pair.bodyB;

                const avgVelocity = {
                    x: (ball1.velocity.x + ball2.velocity.x) / 2,
                    y: (ball2.velocity.y + ball2.velocity.y) / 2
                };

                // Calculate combined area (πr²)
                const area1 = Math.PI * Math.pow(ball1.circleRadius!, 2);
                const area2 = Math.PI * Math.pow(ball2.circleRadius!, 2);
                const combinedArea = area1 + area2;

                // Calculate new radius from combined area
                const newRadius = Math.sqrt(combinedArea / Math.PI);

                // Calculate midpoint between the two balls
                const midpoint = {
                    x: (ball1.position.x + ball2.position.x) / 2,
                    y: (ball1.position.y + ball2.position.y) / 2
                };

                // Create new larger ball
                const newBall = Matter.Bodies.circle(
                    midpoint.x,
                    midpoint.y,
                    newRadius,
                    {
                        restitution: 0.8,
                        frictionAir: 0.01,
                        render: {
                            sprite: {
                                texture: '../images/cat-1.png',
                                xScale: 0.007 * newRadius,
                                yScale: 0.007 * newRadius,
                                yOffset: 0.1
                            }
                        },
                        label: `ball-${bodyANumber + 1}`
                    }
                );

                // Set the average velocity
                Matter.Body.setVelocity(newBall, avgVelocity);

                // Remove both original balls
                Matter.World.remove(world, ball1);
                Matter.World.remove(world, ball2);

                // Remove from tracking array
                const index1 = balls.indexOf(ball1);
                if (index1 > -1) balls.splice(index1, 1);
                const index2 = balls.indexOf(ball2);
                if (index2 > -1) balls.splice(index2, 1);

                // Add the new larger ball
                Matter.World.add(world, newBall);
                balls.push(newBall);

                // Break after handling one collision to avoid modifying array while iterating
                break;
            }
        }
    });
}

