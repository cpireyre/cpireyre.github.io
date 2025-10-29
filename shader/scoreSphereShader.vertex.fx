precision highp float;

//attributes
in vec3 position;
in vec2 uv;

//uniforms
uniform mat4 worldViewProjection;

//varying
out vec2 vUV;

//code
void main(void) {
    gl_Position = worldViewProjection * vec4(position, 1.0);
    vUV = uv;

}
