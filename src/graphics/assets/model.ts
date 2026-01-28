import { GraphicsManager } from "../graphics_manager.ts";
import { ShaderProgram } from "../shader_program.ts";
import { Material } from "./material.ts";
import { Mesh } from "./mesh.ts";

export class Model {
    gm:GraphicsManager;
    mesh:Mesh;
    material:Material;

    constructor(
        gm:GraphicsManager,
        mesh:Mesh,
        material:Material,
    ) {
        this.gm = gm;
        this.mesh = mesh;
        this.material = material;
    }


    draw_start() {
        this.material.draw_start();
    }

    draw_end() {
        this.mesh.draw();
        this.material.draw_end();
    }
}