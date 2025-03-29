import Matter from 'matter-js';

export const createWorld = (world: Matter.World, canvas: HTMLCanvasElement) => {
    const ground = Matter.Bodies.rectangle(
        canvas.width / 2,
        canvas.height - 20,
        canvas.width, 40,
        {
            isStatic: true,
            render: {
                fillStyle: 'green'
            }
        }
    );

    const wallRight = Matter.Bodies.rectangle(
        canvas.width,
        canvas.height / 2,
        10,
        canvas.height,
        { isStatic: true }
    );

    const wallLeft = Matter.Bodies.rectangle(
        0,
        canvas.height / 2,
        10,
        canvas.height,
        { isStatic: true }
    );

    Matter.World.add(world, ground);
    Matter.World.add(world, wallRight);
    Matter.World.add(world, wallLeft);
}