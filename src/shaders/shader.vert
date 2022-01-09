precision highp float;

out vec3 vEye;
out vec3 vNormal;
out vec3 vPosition;

void main() {
    vec4 mvp = modelViewMatrix * vec4(position, 1.0);
    vEye = normalize(mvp.xyz);
    vNormal = normal;
    vPosition = position.xyz;
    gl_Position = projectionMatrix * mvp;
}