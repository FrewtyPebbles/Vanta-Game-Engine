import { Mat4 } from "@vicimpa/glm";
import Engine from "../../engine.ts";
import { Framebuffer } from "../framebuffer.ts";

export class ShadowMap {
    engine:Engine;
    size:number;
    point_shadow_framebuffer:Framebuffer;

    constructor(engine:Engine, size:number, point_shadow_framebuffer:Framebuffer) {
        this.engine = engine;
        this.size = size;
        this.point_shadow_framebuffer = point_shadow_framebuffer;
    }

    render(time:number, delta_time:number) { // SHADOW MAP
        if (this.engine.main_scene.main_camera_3d) {
            this.point_shadow_framebuffer.use();
            
            const ortho_projection = (new Mat4()).orthoNO(0, this.size, 0, this.size, -1, 1);
            this.engine.main_scene.render(
                this.engine.main_scene.main_camera_3d.get_view_matrix(),
                this.engine.main_scene.main_camera_3d.get_projection_matrix(this.engine.canvas),
                ortho_projection,
                time, delta_time
            );
            this.engine.graphics_manager.unuse_framebuffer();
        } else {
            throw Error(`The main scene named "${this.engine.main_scene.name}" does not have a main_camera_3d which is required to render a shadow map.`)
        }
    }
}