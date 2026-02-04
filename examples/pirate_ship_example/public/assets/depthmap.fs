#version 300 es
precision highp sampler2DArrayShadow;
precision highp float;
// or #version 330, 460, etc. depending on your needs

uniform sampler2DArrayShadow sprite_texture;
int debugLayer = 4;          // the layer/index you want to visualize (set via uniform)
float depthBias = 0.0005; // small bias to help visualize precision issues (optional)

in vec2 v_uv;    // screen-space / texture coordinates (usually 0→1)

out vec4 frag_color;

void main()
{
    float depth = texture(sprite_texture, vec4(v_uv, float(debugLayer), 1.0));
    
    // Simple contrast stretch around typical shadow values
    float contrasted = pow(depth, 40.0);
    
    // Or logarithmic mapping (good for seeing small depth differences near 1.0)
    // float contrasted = log2(depth * 1000.0 + 1.0) / log2(1001.0);
    
    vec3 color = vec3(contrasted);
    
    // Highlight clipped / invalid values
    if (depth <= 0.0) color = vec3(1.0, 0.0, 0.8);     // magenta = too close / invalid
    if (depth >= 1.0) color = vec3(0.0, 0.8, 1.0);     // cyan   = far plane
    
    frag_color = vec4(color, 1.0);
}