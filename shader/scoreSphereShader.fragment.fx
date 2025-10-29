precision highp float;

//varying
in vec2 vUV;
uniform float scoreRatio;

//code
void main(void) {
    glFragColor = vec4(scoreRatio, scoreRatio, scoreRatio, 1.0);
}
