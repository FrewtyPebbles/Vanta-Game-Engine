import { Mat3, Mat4, Quat, Vec3 } from "@vicimpa/glm";
import { load_obj } from "./graphics/asset_loaders/obj";
import GraphicsManager, { WebGLUniformType } from "./graphics/graphics_manager";
import { Object3D, Skybox } from "./graphics/node_extensions";
import { InputManager } from "./input/input_manager";
import { CubeMapTexture } from "./graphics/assets";
import Engine from "./engine";


var wobble_quat = new Quat();

var rotation_quat = new Quat();

function update(engine:Engine, time:number, delta_time:number) {

    const im:InputManager = engine.input_manager;

    const gm:GraphicsManager = engine.graphics_manager;

    console.log(engine.root_node);

    const pirate_ship:Object3D = engine.root_node.children[0] as Object3D;

    if (im.is_key_down("KeyA"))
        rotation_quat.mul(new Quat().setAxisAngle(new Vec3(0,1,0), 1 * delta_time));
    if (im.is_key_down("KeyD"))
        rotation_quat.mul(new Quat().setAxisAngle(new Vec3(0,1,0), -1 * delta_time));
    
    const forward = new Vec3(-1, 0, 0).applyQuat(rotation_quat);

    wobble_quat.setAxisAngle(
        forward,
        Math.sin(time / 500) * 10 * delta_time // rocking angle in radians
    );

    if (im.is_key_down("KeyW")) {        
        pirate_ship.position.add(forward.mul(100 * delta_time));
    }

    if (im.is_key_down("KeyS")) {
        pirate_ship.position.add(forward.mul(-100 * delta_time));
    }
    
    pirate_ship.rotation = new Quat().mul(wobble_quat).mul(rotation_quat);
    
    engine.main_camera.rotation.fromMat3(new Mat3().fromMat4(new Mat4().lookAt(engine.main_camera.position, pirate_ship.position.clone().sub(new Vec3(0, -100, 0)), new Vec3(0,1,0)).invert()));
    
}

async function startup(engine:Engine) {

    const im:InputManager = engine.input_manager;

    const gm:GraphicsManager = engine.graphics_manager;

    if (!gm.webgl_enabled()) {
        throw new Error("WebGL2 is not enabled!");
    }

    // 3D SHADER
    const shader_prog_3d = gm.create_shader_program("3D");

    const pirate_ship_model_promise = load_obj(gm, "/assets/models/pirate_ship/source/pirate_ship.obj", [
        "/assets/models/pirate_ship/textures/pirate_ship.png"
    ]);

    shader_prog_3d.add_shader(gm.gl.VERTEX_SHADER, await engine.UTIL.load_text_file("/assets/default_3d.vs"));
    shader_prog_3d.add_shader(gm.gl.FRAGMENT_SHADER, await engine.UTIL.load_text_file("/assets/default_3d.fs"));

    shader_prog_3d.add_uniform("u_model", WebGLUniformType.F4M);
    shader_prog_3d.add_uniform("u_view", WebGLUniformType.F4M);
    shader_prog_3d.add_uniform("u_projection", WebGLUniformType.F4M);

    shader_prog_3d.add_uniform("base_texture", WebGLUniformType.TEXTURE_2D);

    shader_prog_3d.build()

    // SKYBOX SHADER
    const shader_prog_skybox = gm.create_shader_program("SKYBOX");

    shader_prog_skybox.add_shader(gm.gl.VERTEX_SHADER, await engine.UTIL.load_text_file("/assets/default_skybox.vs"));
    shader_prog_skybox.add_shader(gm.gl.FRAGMENT_SHADER, await engine.UTIL.load_text_file("/assets/default_skybox.fs"));

    shader_prog_skybox.add_uniform("u_view", WebGLUniformType.F4M);
    shader_prog_skybox.add_uniform("u_projection", WebGLUniformType.F4M);

    shader_prog_skybox.add_uniform("skybox_texture", WebGLUniformType.TEXTURE_CUBE_MAP);

    shader_prog_skybox.build();

    const skybox_texture = new CubeMapTexture(gm,
        await engine.UTIL.load_image("/assets/skyboxes/learnopengl/top.jpg"),
        await engine.UTIL.load_image("/assets/skyboxes/learnopengl/bottom.jpg"),
        await engine.UTIL.load_image("/assets/skyboxes/learnopengl/front.jpg"),
        await engine.UTIL.load_image("/assets/skyboxes/learnopengl/back.jpg"),
        await engine.UTIL.load_image("/assets/skyboxes/learnopengl/left.jpg"),
        await engine.UTIL.load_image("/assets/skyboxes/learnopengl/right.jpg"),
    {}, 0);

    engine.root_node = new Skybox(engine, "default_skybox", skybox_texture, shader_prog_skybox);

    const pirate_ship_model = await pirate_ship_model_promise;

    if (!pirate_ship_model)
        throw new Error("Failed to load pirate ship model.")

    pirate_ship_model.set_shader_program(shader_prog_3d);

    const pirate_ship = new Object3D(engine, "pirate_ship", pirate_ship_model);

    engine.root_node.push_child(pirate_ship);

    engine.main_camera.position = (new Vec3(0, 2, 5)).mul(70);
}

const canvas: HTMLCanvasElement = document.getElementById("render-canvas") as HTMLCanvasElement;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var engine = new Engine(canvas, startup, update);

engine.start();
