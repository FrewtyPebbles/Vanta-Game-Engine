import { Mat4, Vec3, Vec4 } from "@vicimpa/glm";
import Engine from "../engine.ts";
import { Node3D } from "../node.ts";
import { ShaderProgram } from "../graphics/graphics_manager.ts";

export class Light extends Node3D {
    ambient:Vec3;
    diffuse:Vec3;
    specular:Vec3;

    constructor(
        engine:Engine,
        name:string,
        ambient:Vec3,
        diffuse:Vec3,
        specular:Vec3
    ) {
        super(engine, name);
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
    }



    bind(shader_program:ShaderProgram, array_name:string, index:number): void {
        shader_program.use();
        this.set_uniforms(shader_program, array_name, index);
        this.engine.graphics_manager.clear_shader();
    }

    set_uniforms(shader_program:ShaderProgram, array_name:string, index:number): void {
        this.engine.graphics_manager.set_uniform(`${array_name}[${index}].ambient`, this.ambient);
        this.engine.graphics_manager.set_uniform(`${array_name}[${index}].diffuse`, this.diffuse);
        this.engine.graphics_manager.set_uniform(`${array_name}[${index}].specular`, this.specular);
    }
}

export class PointLight extends Light {
    range:number;
    
    constructor(
        engine:Engine,
        name:string,
        ambient:Vec3,
        diffuse:Vec3,
        specular:Vec3,
        range:number,
    ) {
        super(engine, name, ambient, diffuse, specular);
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.range = range;
    }

    set_uniforms(shader_program: ShaderProgram, array_name: string, index: number): void {
        this.engine.graphics_manager.set_uniform(`${array_name}[${index}].position`, this.position);
        this.engine.graphics_manager.set_uniform(`${array_name}[${index}].range`, this.range);
        super.set_uniforms(shader_program, array_name, index);
    }
}

export class SpotLight extends Light {
    range:number;
    cookie_radius:number;
    
    constructor(
        engine:Engine,
        name:string,
        ambient:Vec3,
        diffuse:Vec3,
        specular:Vec3,
        range:number,
        cookie_radius:number,
    ) {
        super(engine, name, ambient, diffuse, specular);
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.range = range;
        this.cookie_radius = cookie_radius;
    }

    set_uniforms(shader_program: ShaderProgram, array_name: string, index: number): void {
        this.engine.graphics_manager.set_uniform(`${array_name}[${index}].position`, this.position);
        this.engine.graphics_manager.set_uniform(`${array_name}[${index}].rotation`, new Mat4().fromQuat(this.rotation));
        this.engine.graphics_manager.set_uniform(`${array_name}[${index}].range`, this.range);
        this.engine.graphics_manager.set_uniform(`${array_name}[${index}].cookie_radius`, this.cookie_radius);
        super.set_uniforms(shader_program, array_name, index);
    }
}

export class DirectionalLight extends Light {
    constructor(
        engine:Engine,
        name:string,
        ambient:Vec3,
        diffuse:Vec3,
        specular:Vec3,
    ) {
        super(engine, name, ambient, diffuse, specular);
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
    }

    set_uniforms(shader_program: ShaderProgram, array_name: string, index: number): void {
        this.engine.graphics_manager.set_uniform(`${array_name}[${index}].rotation`, new Mat4().fromQuat(this.rotation));
        super.set_uniforms(shader_program, array_name, index);
    }
}