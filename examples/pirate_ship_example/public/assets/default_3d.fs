#version 300 es
precision highp float;

in vec3 v_normal;
in vec2 v_uv;
in vec3 v_frag_pos;


out vec4 frag_color;

#define N_POINT_LIGHTS 50
#define N_SPOT_LIGHTS 50
#define N_DIRECTIONAL_LIGHTS 10

// fallback values
struct Material {
    vec3  albedo;
    float metallic;
    float roughness;
    float ao;
};
// PBR
uniform sampler2D texture_albedo;
uniform sampler2D texture_normal;
uniform sampler2D texture_metallic;
uniform sampler2D texture_roughness;
uniform sampler2D texture_ao;

struct PointLight {
    vec3 position;
    float range;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct SpotLight {
    vec3 position;
    mat4 rotation;
    float range;
    float cookie_radius;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct DirectionalLight {
    mat4 rotation;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

uniform PointLight point_lights[N_POINT_LIGHTS];
uniform SpotLight spot_lights[N_SPOT_LIGHTS];
uniform DirectionalLight directional_lights[N_DIRECTIONAL_LIGHTS];

vec4 calculate_point_light(DirectionalLight light, vec3 normal, vec3 viewDir);

void main() {
    vec4 base_color = texture(texture_albedo, vec2(v_uv.x, v_uv.y));

    frag_color = base_color;
}

vec4 calculate_point_light(DirectionalLight light, vec3 normal, vec3 viewDir) {
    // TODO
    return vec4(0.0);
}
