#version 300 es
layout (location = 0) in vec3 a_position;

out vec4 v_frag_pos;

uniform mat4 u_model;
uniform mat4 u_light_space_matrix;

void main()
{
    v_frag_pos = u_model * vec4(a_position, 1.0);
    gl_Position = u_light_space_matrix * v_frag_pos;
}