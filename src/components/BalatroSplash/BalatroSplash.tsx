import { useState, useRef, useEffect } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import { HexColorPicker, HexColorInput } from "react-colorful";
import "./styles.css";
import { hexToVec4 } from "../../functions/helper";

export default function BalatroSplash() {
  const [primaryColor, setPrimaryColor] = useState('#de443b'); // #de433b
  const [secondaryColor, setSecondaryColor] = useState('#006bb4'); // #006bb4

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2) });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);

    const vertex = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragment = `
      precision highp float;

      #define PIXEL_SIZE_FAC 700.0
      #define BLACK (0.6 * vec4(79.0 / 255.0, 99.0 / 255.0, 103.0 / 255.0, 1.0 / 0.6))

      uniform float time;
      uniform float vort_speed;
      uniform vec4 color_1;
      uniform vec4 color_2;
      uniform float mid_flash;
      uniform float vort_offset;
      uniform vec3 iResolution;

      void main() {
        vec2 screen_coords = gl_FragCoord.xy;
        float pixel_size = length(iResolution.xy) / PIXEL_SIZE_FAC;

        vec2 uv = (floor(screen_coords / pixel_size) * pixel_size - 0.5 * iResolution.xy) / length(iResolution.xy);
        float uv_len = length(uv);

        float speed = time * vort_speed;
        float angle = atan(uv.y, uv.x)
          + (2.2 + 0.4 * min(6.0, speed)) * uv_len
          - 1.0
          - speed * 0.05
          - min(6.0, speed) * speed * 0.02
          + vort_offset;

        vec2 mid = (iResolution.xy / length(iResolution.xy)) / 2.0;
        vec2 sv = vec2(uv_len * cos(angle) + mid.x, uv_len * sin(angle) + mid.y) - mid;

        sv *= 30.0;
        speed = time * 6.0 * vort_speed + vort_offset + 1033.0;
        vec2 uv2 = vec2(sv.x + sv.y);

        for (int i = 0; i < 5; i++) {
          uv2 += sin(max(sv.x, sv.y)) + sv;
          sv += 0.5 * vec2(
            cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
            sin(uv2.x - 0.113 * speed)
          );
          sv -= cos(sv.x + sv.y) - sin(sv.x * 0.711 - sv.y);
        }

        float smoke_res = min(2.0, max(-2.0, 1.5 + length(sv) * 0.12 - 0.17 * (min(10.0, time * 1.2 - 4.0))));
        if (smoke_res < 0.2) {
          smoke_res = (smoke_res - 0.2) * 0.6 + 0.2;
        }

        float c1p = max(0.0, 1.0 - 2.0 * abs(1.0 - smoke_res));
        float c2p = max(0.0, 1.0 - 2.0 * smoke_res);
        float cb  = 1.0 - min(1.0, c1p + c2p);

        vec4 ret_col = color_1 * c1p + color_2 * c2p + vec4(cb * BLACK.rgb, cb * color_1.a);
        float mod_flash = max(mid_flash * 0.8, max(c1p, c2p) * 5.0 - 4.4) + mid_flash * max(c1p, c2p);

        gl_FragColor = ret_col * (1.0 - mod_flash) + mod_flash * vec4(1.0);
      }
    `;

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        time: { value: 0 },
        vort_speed: { value: 1.0 },
        color_1: { value: hexToVec4(primaryColor) },
        color_2: { value: hexToVec4(secondaryColor) },
        mid_flash: { value: 0.0 },
        vort_offset: { value: 0.0 },
        iResolution: {
          value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height],
        },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      program.uniforms.iResolution.value = [
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height,
      ];
    };
    window.addEventListener("resize", resize);
    resize();

    let frameId: number;
    const start = performance.now() - 12000; // skip intro animation

    const render = (t: number) => {
      const elapsed = (t - start) * 0.001;
      program.uniforms.time.value = elapsed;

      renderer.render({ scene: mesh });
      frameId = requestAnimationFrame(render);
    };
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [primaryColor, secondaryColor]);

  return (
    <div className="balatro-splash-wrapper">
      <div ref={containerRef} className="balatro-splash-container" />
      <div className="color-picker-wrapper">
        <h2>Splash Colors</h2>
        <div className="color-picker">
          <HexColorPicker color={primaryColor} onChange={setPrimaryColor} />
          <HexColorInput color={primaryColor} onChange={setPrimaryColor} />
        </div>
        <div className="color-picker">
          <HexColorPicker color={secondaryColor} onChange={setSecondaryColor} />
          <HexColorInput color={secondaryColor} onChange={setSecondaryColor} />
        </div>
      </div>
    </div>
  );
}