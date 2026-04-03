import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";

export class AvatarController {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private vrm?: any;
  private clock = new THREE.Clock();
  private isSpeaking = false;
  private currentText = "";
  private speechStartTime = 0;

  private visemeMap: Record<string, string> = {
    "अ": "aa", "आ": "aa", "ा": "aa", "इ": "ih", "ई": "ih", "ि": "ih", "ी": "ih",
    "उ": "ou", "ऊ": "ou", "ु": "ou", "ू": "ou", "ए": "ee", "ऐ": "ee", "े": "ee", "ै": "ee",
    "ओ": "oh", "औ": "oh", "ो": "oh", "ौ": "oh", "ं": "aa", "ः": "aa"
  };

  constructor(container: HTMLDivElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 1.45, 1.1);
    this.camera.lookAt(0, 1.45, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(1, 2, 1);
    this.scene.add(light, new THREE.AmbientLight(0xffffff, 0.8));

    new GLTFLoader().register(p => new VRMLoaderPlugin(p)).load("/avatar.vrm", (gltf) => {
      const vrm = gltf.userData.vrm;
      this.vrm = vrm;
      VRMUtils.removeUnnecessaryJoints(gltf.scene);
      this.scene.add(vrm.scene);
      vrm.scene.rotation.y = Math.PI;
    });

    this.animate();
  }

  public speak(text: string) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.rate = 0.8;

    utterance.onstart = () => {
      this.currentText = text;
      this.speechStartTime = this.clock.elapsedTime;
      this.isSpeaking = true;
    };
    utterance.onend = () => { this.isSpeaking = false; };
    window.speechSynthesis.speak(utterance);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    const elapsed = this.clock.elapsedTime;

    if (this.vrm) {
      // 1. Update the VRM engine first
      this.vrm.update(delta);

      // 2. OVERRIDE THE T-POSE (Must happen after update)
      const humanoid = this.vrm.humanoid;
      if (humanoid) {
        const lua = humanoid.getNormalizedBoneNode("leftUpperArm");
        const rua = humanoid.getNormalizedBoneNode("rightUpperArm");
        const neck = humanoid.getNormalizedBoneNode("neck");
        
        if (lua) lua.rotation.z = 1.35; 
        if (rua) rua.rotation.z = -1.35;
        if (neck) neck.rotation.y = Math.sin(elapsed * 0.5) * 0.04;
      }

      // 3. Lip Sync
      const em = this.vrm.expressionManager;
      if (em) {
        em.setValue("blink", Math.sin(elapsed * 0.5) > 0.98 ? 1 : 0);
        if (this.isSpeaking) {
          const time = elapsed - this.speechStartTime;
          const charIndex = Math.floor(time / 0.12) % this.currentText.length;
          const char = this.currentText[charIndex];
          const target = this.visemeMap[char] || "aa";
          ["aa", "ih", "ou", "ee", "oh"].forEach(k => em.setValue(k, 0));
          if (char !== " " && char !== ".") em.setValue(target, 1);
        } else {
          ["aa", "ih", "ou", "ee", "oh"].forEach(k => em.setValue(k, 0));
        }
        em.update();
      }
    }
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    this.renderer.dispose();
  }
}