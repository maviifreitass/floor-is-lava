import * as THREE from "three";

export class WorldScene extends THREE.Scene {
  constructor() {
    super();
    this.fog = new THREE.Fog(0x1a1a40, 0, 300);

    // Material vermelho para o chão
    this.materialA = new THREE.MeshStandardMaterial({ color: 0xE42E22, emissive: 0xE42E22, emissiveIntensity: 0.5 });

    this.setLight();
    this.setFloor();
    this.setSparks();
    this.setFire();
  }

  setLight() {
    const ambientLight = new THREE.AmbientLight(0xE42E22, 0.2);
    this.add(ambientLight);

    const spotlight = new THREE.SpotLight(0xE42E22, 0.9, 0, Math.PI / 4, 1);
    spotlight.position.set(10, 80, 20);
    spotlight.target.position.set(0, 0, 0);
    spotlight.castShadow = true;
    spotlight.shadow.camera.near = 10;
    spotlight.shadow.camera.far = 100;
    spotlight.shadow.camera.fov = 30;
    spotlight.shadow.mapSize.width = 2048;
    spotlight.shadow.mapSize.height = 2048;
    this.add(spotlight);
  }

  setFloor() {
    const floorGeometry = new THREE.PlaneGeometry(700, 700, 250, 10);
    floorGeometry.rotateX(-Math.PI / 2);
    const floor = new THREE.Mesh(floorGeometry, this.materialA);
    floor.receiveShadow = true;
    this.add(floor);
  }

  setSparks() {
    const sparkGeometry = new THREE.BufferGeometry();
    const sparkMaterial = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 2,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending, // Para melhorar a aparência das faíscas
      depthWrite: false
    });
  
    const sparkPositions = [];
    const sparkVelocities = [];
  
    // Gerando partículas com posições e velocidades iniciais
    for (let i = 0; i < 200; i++) {
      let x = (Math.random() - 0.5) * 700;
      let y = Math.random() * 10;
      let z = (Math.random() - 0.5) * 700;
      sparkPositions.push(x, y, z);
  
      // Velocidades das partículas
      let velocity = new THREE.Vector3(
        (Math.random() - 0.5),  // Velocidade aleatória nos eixos X
        Math.random() * 2,      // Velocidade para cima (mais forte)
        (Math.random() - 0.5)    // Velocidade aleatória nos eixos Z
      );
      sparkVelocities.push(velocity.x, velocity.y, velocity.z);
    }
  
    sparkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sparkPositions, 3));
    sparkGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(sparkVelocities, 3));
  
    const sparks = new THREE.Points(sparkGeometry, sparkMaterial);
    this.add(sparks);
  
    // Função para animar o movimento das faíscas
    this.animateSparks(sparks, sparkGeometry);
  }
  
  animateSparks(sparks, sparkGeometry) {
    const positions = sparkGeometry.attributes.position.array;
    const velocities = sparkGeometry.attributes.velocity.array;
  
    // Função para atualizar as posições das faíscas
    function updateSparks() {
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];         // Atualiza a posição no eixo X
        positions[i + 1] += velocities[i + 1]; // Atualiza a posição no eixo Y
        positions[i + 2] += velocities[i + 2]; // Atualiza a posição no eixo Z
  
        // Se as faíscas ultrapassarem o limite (por exemplo, no eixo Y), reinicie a posição
        if (positions[i + 1] > 100) { // Limite superior no eixo Y
          positions[i + 1] = 0; // Volta para a base
        }
        if (positions[i + 1] < 0) { // Limite inferior no eixo Y
          positions[i + 1] = 0; // Volta para a base
        }
  
        // Se as faíscas saírem da tela no eixo X ou Z, reposicione-as aleatoriamente
        if (positions[i] > 350 || positions[i] < -350) {
          positions[i] = (Math.random() - 0.5) * 700;
        }
        if (positions[i + 2] > 350 || positions[i + 2] < -350) {
          positions[i + 2] = (Math.random() - 0.5) * 700;
        }
      }
  
      // Atualiza as posições das partículas
      sparkGeometry.attributes.position.needsUpdate = true;
  
      // Continuar a animação
      requestAnimationFrame(updateSparks);
    }
  
    updateSparks();
  }
  

  setFire() {
    const fireTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/lava/lavatile.jpg');
    fireTexture.wrapS = fireTexture.wrapT = THREE.RepeatWrapping;
    
    const fireMaterial = new THREE.MeshStandardMaterial({ 
      map: fireTexture, 
      emissive: 0xff4500, 
      emissiveMap: fireTexture, 
      emissiveIntensity: 1.5
    });

    const fireGeometry = new THREE.PlaneGeometry(700, 700);
    fireGeometry.rotateX(-Math.PI / 2);
    const fire = new THREE.Mesh(fireGeometry, fireMaterial);
    fire.position.y = 0.2;
    fire.receiveShadow = true;
    this.add(fire);
  }
}