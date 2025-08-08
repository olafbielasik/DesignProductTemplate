import * as THREE from 'three';

(() => {
  const bgCanvas = document.getElementById('bgfx');
  if (!bgCanvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas: bgCanvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const clock = new THREE.Clock();

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;
    varying vec2 vUv;

    vec3 blob(vec2 uv, vec2 pos, float radius, vec3 color) {
        float d = distance(uv, pos);
        float falloff = 1.0 - smoothstep(0.0, radius, d);
        return color * falloff;
    }

    void main() {
        vec2 uv = vUv;
        vec3 color = vec3(0.0);

        vec3 deepBlue = vec3(0.1, 0.2, 0.7);
        vec3 navyBlue = vec3(0.05, 0.1, 0.4);
        vec3 purple   = vec3(0.5, 0.2, 0.8);
        vec3 pink     = vec3(0.9, 0.3, 0.5);

        vec2 pos1 = vec2(0.3 + sin(u_time * 0.4) * 0.35, 0.7 + cos(u_time * 0.5) * 0.35);
        float radius1 = 0.5 + sin(u_time * 0.8) * 0.15;
        vec3 color1 = mix(deepBlue, navyBlue, 0.5 + 0.5 * sin(u_time * 0.2));
        color += blob(uv, pos1, radius1, color1);

        vec2 pos2 = vec2(0.7 + cos(u_time * 0.3) * 0.3, 0.3 + sin(u_time * 0.4) * 0.3);
        float radius2 = 0.6 + cos(u_time * 0.65) * 0.15;
        vec3 color2 = mix(purple, pink, 0.5 + 0.5 * cos(u_time * 0.15));
        color += blob(uv, pos2, radius2, color2);

        vec2 pos3 = vec2(0.5 + sin(u_time * 0.5) * 0.4, 0.5 + cos(u_time * 0.35) * 0.4);
        float radius3 = 0.55 + sin(u_time * 0.45) * 0.12;
        vec3 color3 = mix(navyBlue, purple, 0.5 + 0.5 * sin(u_time * 0.25));
        color += blob(uv, pos3, radius3, color3);
        
        vec2 mousePos = u_mouse;
        float mouseRadius = 0.4;
        vec3 mouseColor = purple;
        color += blob(uv, mousePos, mouseRadius, mouseColor);

        color *= 0.5;

        gl_FragColor = vec4(color, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2() },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) }
    },
    vertexShader,
    fragmentShader,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
  }
  
  function onMouseMove(event) {
    material.uniforms.u_mouse.value.x = event.clientX / window.innerWidth;
    material.uniforms.u_mouse.value.y = 1.0 - (event.clientY / window.innerHeight);
  }

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  function loop() {
    requestAnimationFrame(loop);
    material.uniforms.u_time.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  }

  onResize();
  loop();
})();