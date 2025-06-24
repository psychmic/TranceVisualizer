import { useState, useRef, useEffect, useCallback } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import { hexToVec4 } from "../../functions/helper";
import BossBlinds from "../BossBlinds/BossBlinds";
import "./BackgroundShader.css";

export default function BackgroundShader() {
  const [selectedBlind, setSelectedBlind] = useState('Small Blind');
  const containerRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<Program | null>(null);

  const isBossBlind = useCallback((blindName: string) => blindName !== 'Small Blind' && blindName !== 'Big Blind', []);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2) });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);

    const vertex = `
      attribute vec2 uv;
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
      }
    `;

    const fragment = `
      precision highp float;

      uniform float time;
      uniform float spin_time;
      uniform float contrast;
      uniform float spin_amount;
      uniform vec4 colour_1;
      uniform vec4 colour_2;
      uniform vec4 colour_3;
      uniform vec2 iResolution;

      #define PIXEL_SIZE_FAC 700.0
      #define SPIN_EASE 0.5

      void main() {
        vec2 screen_coords = gl_FragCoord.xy;
        float pixel_size = length(iResolution.xy) / PIXEL_SIZE_FAC;
        vec2 uv = (floor(screen_coords * (1.0 / pixel_size)) * pixel_size - 0.5 * iResolution.xy) / length(iResolution.xy) - vec2(0.12, 0.0);
        float uv_len = length(uv);

        float speed = (spin_time * SPIN_EASE * 0.01) + 302.2;
        float new_pixel_angle = atan(uv.y, uv.x) - speed + SPIN_EASE * 20.0 * (spin_amount * uv_len + (1.0 - spin_amount));
        vec2 mid = (iResolution.xy / length(iResolution.xy)) / 2.0;
        uv = vec2(uv_len * cos(new_pixel_angle) + mid.x, uv_len * sin(new_pixel_angle) + mid.y) - mid;

        uv *= 30.0;
        speed = time * 2.0;
        vec2 uv2 = vec2(uv.x + uv.y);

        for (int i = 0; i < 5; i++) {
          uv2 += sin(max(uv.x, uv.y)) + uv;
          uv += 0.5 * vec2(cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121), sin(uv2.x - 0.113 * speed));
          uv -= 1.0 * cos(uv.x + uv.y) - 1.0 * sin(uv.x * 0.711 - uv.y);
        }

        float contrast_mod = (0.25 * contrast + 0.5 * spin_amount + 1.2);
        float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
        float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
        float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
        float c3p = 1.0 - min(1.0, c1p + c2p);

        vec4 ret_col = (0.3 / contrast) * colour_1 + (1.0 - 0.3 / contrast) * (colour_1 * c1p + colour_2 * c2p + vec4(c3p * colour_3.rgb, c3p * colour_1.a));
        gl_FragColor = ret_col;
      }
    `;

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        time: { value: 0 },
        spin_time: { value: 0 },
        contrast: { value: 1.0 },
        spin_amount: { value: 0.0 },
        colour_1: { value: hexToVec4("#de443b") },
        colour_2: { value: hexToVec4("#006bb4") },
        colour_3: { value: hexToVec4("#ffffff") },
        iResolution: { value: [gl.canvas.width, gl.canvas.height] },
      },
    });

    programRef.current = program;

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      program.uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height];
    };
    window.addEventListener("resize", resize);
    resize();

    let frameId: number;
    const start = performance.now();

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
  }, []);

  useEffect(() => {
    if (!programRef.current) return;
    const program = programRef.current;
    program.uniforms.spin_amount.value = isBossBlind(selectedBlind) ? 0.5 : 0.0;
    program.uniforms.spin_time.value = isBossBlind(selectedBlind) ? program.uniforms.time.value : 0.0;
  }, [isBossBlind, selectedBlind]);

  return (
    <section>
      <h2>Background Shader</h2>
      <div className="background-content">
        <div ref={containerRef} className="canvas-container" />
        <BossBlinds 
          selectedBlind={selectedBlind}
          setSelectedBlind={setSelectedBlind}
        />
        <div className="color-picker-wrapper">
          {/* ColorPickers go here */}
        </div>
      </div>
    </section>
  );
}