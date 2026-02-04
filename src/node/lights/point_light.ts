import { Mat4, Vec3, Vec4 } from "@vicimpa/glm";
import Engine from "../../engine.ts";
import { Node } from "../../node.ts";
import { Light } from "./light.ts";
import { ShaderProgram } from "../../graphics/shader_program.ts";
import { AttachmentType, Framebuffer } from "../../graphics/framebuffer.ts";
import { CubeMapTexture, TextureType } from "../../graphics/assets/texture.ts";

// TODO SWITCH SO IT USES 
// sampler2DArrayShadow with a stride of 6 textures for each face
// instead of samplerCubeShadow because samplerCubeShadow takes up more texture units for multiple lights anyways.

const point_light_shadow_lookat_values = [
    [new Vec3(1.0, 0.0, 0.0), new Vec3(0.0, 1.0, 0.0)], // Center offset from eye, Up
    [new Vec3(-1.0, 0.0, 0.0), new Vec3(0.0, 1.0, 0.0)],
    [new Vec3(0.0, 1.0, 0.0), new Vec3(0.0, 0.0, 1.0)],
    [new Vec3(0.0, -1.0, 0.0), new Vec3(0.0, 0.0, -1.0)],
    [new Vec3(0.0, 0.0, 1.0), new Vec3(0.0, 1.0, 0.0)],
    [new Vec3(0.0, 0.0, -1.0), new Vec3(0.0, 1.0, 0.0)],
];

export class PointLight extends Light {
    private stored_range:number;
    shadow_index_offset:number;

    shader_program:ShaderProgram;
    framebuffer:Framebuffer;

    shadow_projection:Mat4 = new Mat4();

    point_light_space_matrices:Mat4[] = [
        new Mat4(),
        new Mat4(),
        new Mat4(),
        new Mat4(),
        new Mat4(),
        new Mat4(),
    ];
    
    constructor(
        engine:Engine,
        name:string,
        color:Vec3,
        ambient:number,
        diffuse:number,
        specular:number,
        energy:number,
        range:number,
        shader_program:ShaderProgram|null = null,
    ) {
        super(engine, name, color, ambient, diffuse, specular, energy);
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.stored_range = range;
        this.range = range;
        this.shadow_index_offset = this.engine.graphics_manager.point_lights.length * 6;
        this.framebuffer = this.engine.graphics_manager.point_shadow_depth_buffer;
        this.shader_program = shader_program ? shader_program : this.engine.graphics_manager.create_default_point_shadow_shader_program();
    }

    get range():number {
        return this.stored_range;
    }

    set range(value:number) {
        this.stored_range = value;
        this.on_change_range(value);
    }

    on_change_range(value:number) {        
        this.shadow_projection = new Mat4().perspectiveZO(90.0 * Math.PI/180, 1, 0.1, value);
        for (let i = 0; i < 6; ++i) {
            const [center_offset, up] = point_light_shadow_lookat_values[i];
            // view matrix: look from light to center + offset
            const view = new Mat4().lookAt(this.position, this.position.clone().add(center_offset), up);
            // shadow matrix: projection * view
            this.point_light_space_matrices[i] = this.shadow_projection.clone().mul(view);
        }
    }

    protected on_change_position(new_value: Vec3): void {        
        for (let i = 0; i < 6; ++i) {
            const [center_offset, up] = point_light_shadow_lookat_values[i];
            // view matrix: look from light to center + offset
            const view = new Mat4().lookAt(this.position, this.position.clone().add(center_offset), up);
            // shadow matrix: projection * view
            this.point_light_space_matrices[i] = this.shadow_projection.clone().mul(view);
        }
    }

    draw_shadow_map(view_matrix: Mat4, projection_matrix_3d: Mat4, projection_matrix_2d: Mat4, time: number, delta_time: number): void {
        if (this.engine.main_scene.main_camera_3d) {
            this.engine.main_scene.rendering_depth_map = true
            
            this.shader_program.use();
                        
            this.framebuffer.use();
            
            this.engine.graphics_manager.gl.cullFace(this.engine.graphics_manager.gl.FRONT);
            
            for (var i = 0; i < 6; ++i) {
                
                this.framebuffer.set_attachment_texture_index("depth", this.shadow_index_offset + i);
                
                this.framebuffer.clear();

                // Set uniforms
                this.engine.graphics_manager.set_uniform(`u_light_space_matrix`, this.point_light_space_matrices[i]);
                this.engine.graphics_manager.set_uniform(`origin`, this.position);
                this.engine.graphics_manager.set_uniform(`range`, this.range);

                // Render shadows to map
                this.engine.main_scene.render(
                    view_matrix,
                    projection_matrix_3d,
                    projection_matrix_2d,
                    time, delta_time
                );
                
            }
            
            this.engine.graphics_manager.gl.cullFace(this.engine.graphics_manager.gl.BACK);

            this.engine.graphics_manager.unuse_framebuffer();
            
            this.engine.graphics_manager.clear_shader();
            
            this.engine.main_scene.rendering_depth_map = false;
        } else {
            throw Error(`The main scene named "${this.engine.main_scene.name}" does not have a main_camera_3d which is required to render a shadow map.`)
        }
    }

    set_uniforms(array_name: string, index: number): void {
        const world_matrix = this.get_world_matrix();
        this.engine.graphics_manager.set_uniform(`${array_name}[${index}].position`, new Vec3(world_matrix[12], world_matrix[13], world_matrix[14]));
        this.engine.graphics_manager.set_uniform(`${array_name}[${index}].range`, this.range);

        // Set shadow map uniforms        
        this.engine.graphics_manager.set_uniform(`point_light_shadow_maps`, this.framebuffer.attachment_info_map["depth"].texture);
        for (var i = 0; i < 6; ++i) {
            this.engine.graphics_manager.set_uniform(`u_point_light_space_matrix[${index * 6 + i}]`, this.point_light_space_matrices[i]);
        }        

        super.set_uniforms(array_name, index);
    }

    protected on_parented(): void {
        this.engine.graphics_manager.point_lights.push(this);
        this.engine.graphics_manager.resize_directional_shadow_map();
    }

    protected on_removed(node:this, engine:Engine, parent:Node): void {
        super.on_removed(node, engine, parent)
        let light_index = this.engine.graphics_manager.point_lights.indexOf(this);
        if (light_index > -1) {
            this.engine.graphics_manager.point_lights.splice(light_index, 1);
        }
        this.engine.graphics_manager.resize_directional_shadow_map();
    }
}