import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import "./BalatroSplash.css";

export default function BalatroSplash() {
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
      varying vec2 vUv;
      void main() {
        // replicate LÖVE2D uv: position from [-1,1] to [0,1]
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragment = `
      precision highp float;

      #define PIXEL_SIZE_FAC 700.0
      #define SPIN_EASE 0.5

      uniform float time;
      uniform float spin_time;
      uniform vec4 colour_1;
      uniform vec4 colour_2;
      uniform vec4 colour_3;
      uniform float contrast;
      uniform float spin_amount;
      uniform float lighting;
      uniform vec3 iResolution;
      uniform vec2 offset;

      void main() {
        // get exact screen coords
        vec2 screen_coords = gl_FragCoord.xy;

        // pixelation
        float pixel_size = length(iResolution.xy) / PIXEL_SIZE_FAC;
        vec2 uv = (
          floor(screen_coords / pixel_size) * pixel_size
          - 0.5 * iResolution.xy
        ) / length(iResolution.xy)
        - offset;

        float uv_len = length(uv);

        // central swirl
        float speed = (spin_time * SPIN_EASE * 0.2) + 302.2;
        float angle = atan(uv.y, uv.x)
          + speed
          - SPIN_EASE * 20.0 * (spin_amount * uv_len + (1.0 - spin_amount));

        vec2 mid = (iResolution.xy / length(iResolution.xy)) / 2.0;
        uv = vec2(
          uv_len * cos(angle) + mid.x,
          uv_len * sin(angle) + mid.y
        ) - mid;

        // paint deformation
        uv *= 30.0;
        speed = time * 2.0;
        vec2 uv2 = uv.xx + uv.yy;

        for (int i = 0; i < 5; i++) {
          uv2 += sin(max(uv.x, uv.y)) + uv;
          uv += 0.5 * vec2(
            cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
            sin(uv2.x - 0.113 * speed)
          );
          uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
        }

        // paint blending
        float contrast_mod = 0.25 * contrast + 0.5 * spin_amount + 1.2;
        float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
        float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
        float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
        float c3p = 1.0 - min(1.0, c1p + c2p);

        // base color blend
        vec4 baseBlend = (0.3 / contrast) * colour_1
          + (1.0 - 0.3 / contrast) * (
              colour_1 * c1p +
              colour_2 * c2p +
              vec4(c3p * colour_3.rgb, c3p * colour_1.a)
            );

        // highlights term from Balatro shader
        float light = (lighting - 0.2) * max(c1p * 5.0 - 4.0, 0.0)
                    + lighting       * max(c2p * 5.0 - 4.0, 0.0);

        gl_FragColor = baseBlend + vec4(vec3(light), 0.0);
      }
    `;

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        time: { value: 0 },
        spin_time: { value: 0 },
        colour_1: { value: [0.871, 0.267, 0.231, 1.0] },
        colour_2: { value: [0.0, 0.42, 0.706, 1.0] },
        colour_3: { value: [0.086, 0.137, 0.145, 1.0] },
        contrast: { value: 1.0 },
        spin_amount: { value: 1.0 },
        lighting: { value: 0.4 },
        offset: { value: [0.0, 0.0] },
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
    const start = performance.now();

    const render = (t: number) => {
      const elapsed = (t - start) * 0.001;
      program.uniforms.time.value = elapsed;
      program.uniforms.spin_time.value = elapsed;

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

  return <div ref={containerRef} className="balatro-splash-container" />;
}