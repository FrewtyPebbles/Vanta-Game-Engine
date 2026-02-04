export default `#version 300 es
precision highp float;

in vec4 v_frag_pos;

uniform vec3 origin;
uniform float range;

void main()
{
    float dist = length(v_frag_pos.xyz - origin);
    gl_FragDepth = dist / range;
}
`;