precision highp float;

// clang-format off
#include utils/noise-simplex-4d;
// clang-format on

uniform float u_time;
uniform float u_amplitude;
uniform float u_frequency;

uniform sampler2D u_matCapTex;

in vec3 vEye;
in vec3 vNormal;
in vec3 vPosition;

void main() {
    // distort normal direction
    // TODO: probably a better way to do this
    float xDistortion = snoise(vec4(vPosition * u_frequency, u_time)) * u_amplitude;
    float yDistortion = snoise(vec4(vPosition * u_frequency, u_time * 2.)) * u_amplitude;
    float zDistortion = snoise(vec4(vPosition * u_frequency, u_time * 0.5)) * u_amplitude;
    vec3 normal =
        normalize(vec3(xDistortion * 0.5 + 0.0, yDistortion * 0.5 + 0.0, zDistortion * 0.5 + 0.0));

    // calc matcap coords
    vec3 r = reflect(vEye, normal);
    float m = 2.0 * sqrt(pow(r.x, 2.0) + pow(r.y, 2.0) + pow(r.z + 1.2, 2.0));
    vec2 vN = r.xy / m + 0.5;

    // lookup matcap
    vec3 mat = texture2D(u_matCapTex, vN).rgb;
    gl_FragColor = vec4(mat, 1.0);

    // gl_FragColor = vec4(normal, 1.0);
}