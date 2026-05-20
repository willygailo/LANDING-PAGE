// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x2a1a2e, 0.012);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 8, 22);
camera.lookAt(0, 2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Mobile detection for performance scaling
const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

// Lighting
const ambientLight = new THREE.AmbientLight(0x5a4a6a, 0.5);
scene.add(ambientLight);

const warmFill = new THREE.DirectionalLight(0xff9c74, 0.85);
warmFill.position.set(5, 10, 5);
warmFill.castShadow = true;
warmFill.shadow.mapSize.width = isMobile ? 1024 : 2048;
warmFill.shadow.mapSize.height = isMobile ? 1024 : 2048;
warmFill.shadow.camera.near = 0.5;
warmFill.shadow.camera.far = 60;
warmFill.shadow.camera.left = -25;
warmFill.shadow.camera.right = 25;
warmFill.shadow.camera.top = 25;
warmFill.shadow.camera.bottom = -25;
scene.add(warmFill);

const coolFill = new THREE.DirectionalLight(0x6a6aff, 0.25);
coolFill.position.set(-10, 5, -5);
scene.add(coolFill);

const rimLight = new THREE.PointLight(0xff6b4a, 1, 35);
rimLight.position.set(-8, 8, -8);
scene.add(rimLight);

// Ground
const groundGeo = new THREE.PlaneGeometry(80, 80, 60, 60);
const posAttr = groundGeo.attributes.position;
for (let i = 0; i < posAttr.count; i++) {
  const x = posAttr.getX(i);
  const y = posAttr.getY(i);
  posAttr.setZ(i, Math.sin(x * 0.3) * 0.15 + Math.cos(y * 0.4) * 0.1);
}
groundGeo.computeVertexNormals();

const groundMat = new THREE.MeshStandardMaterial({
  color: 0x2a4a2a,
  roughness: 0.95,
  metalness: 0.05
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Path - wider, brighter, more visible
const pathCurve = new THREE.CubicBezierCurve3(
  new THREE.Vector3(-14, 0.03, 14),
  new THREE.Vector3(-5, 0.03, 3),
  new THREE.Vector3(4, 0.03, -4),
  new THREE.Vector3(14, 0.03, -10)
);

const pathSegments = 100;
const pathGroup = new THREE.Group();
const cobbleMat = new THREE.MeshStandardMaterial({
  color: 0xc8b8a0,
  roughness: 0.75,
  metalness: 0.05
});

for (let i = 0; i < pathSegments; i++) {
  const t = i / pathSegments;
  const point = pathCurve.getPoint(t);
  const tangent = pathCurve.getTangent(t);

  const cobbleGeo = new THREE.BoxGeometry(3, 0.12, 0.8);
  const cobble = new THREE.Mesh(cobbleGeo, cobbleMat);
  cobble.position.copy(point);
  cobble.position.y = 0.06;
  cobble.rotation.y = Math.atan2(tangent.x, tangent.z);
  cobble.receiveShadow = true;
  pathGroup.add(cobble);
}
scene.add(pathGroup);

// Path curbs
const curbMat = new THREE.MeshStandardMaterial({
  color: 0x9a9a8a,
  roughness: 0.7
});

for (let side = -1; side <= 1; side += 2) {
  for (let i = 0; i < pathSegments; i++) {
    const t = i / pathSegments;
    const point = pathCurve.getPoint(t);
    const tangent = pathCurve.getTangent(t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

    const curbGeo = new THREE.BoxGeometry(0.25, 0.18, 0.85);
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.copy(point);
    curb.position.y = 0.09;
    curb.position.add(normal.multiplyScalar(side * 1.55));
    curb.rotation.y = Math.atan2(tangent.x, tangent.z);
    curb.receiveShadow = true;
    scene.add(curb);
  }
}

// Houses
function createHouse(x, z, rotation, wallColor, roofColor, scale = 1) {
  const group = new THREE.Group();

  const bodyGeo = new THREE.BoxGeometry(2.5 * scale, 2 * scale, 2 * scale);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: wallColor,
    roughness: 0.7,
    metalness: 0.05
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1 * scale;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roofGeo = new THREE.ConeGeometry(2 * scale, 1.2 * scale, 4);
  const roofMat = new THREE.MeshStandardMaterial({
    color: roofColor,
    roughness: 0.6,
    metalness: 0.1
  });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 2.6 * scale;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);

  const doorGeo = new THREE.BoxGeometry(0.5 * scale, 0.9 * scale, 0.1);
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x5a3a2a,
    roughness: 0.8
  });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 0.45 * scale, 1.01 * scale);
  group.add(door);

  const windowMat = new THREE.MeshStandardMaterial({
    color: 0xffcc66,
    emissive: 0xffaa33,
    emissiveIntensity: 0.8,
    roughness: 0.3,
    metalness: 0.2
  });

  const windowGeo = new THREE.PlaneGeometry(0.45 * scale, 0.5 * scale);

  const win1 = new THREE.Mesh(windowGeo, windowMat.clone());
  win1.position.set(-0.6 * scale, 1.2 * scale, 1.01 * scale);
  group.add(win1);

  const win2 = new THREE.Mesh(windowGeo, windowMat.clone());
  win2.position.set(0.6 * scale, 1.2 * scale, 1.01 * scale);
  group.add(win2);

  const sideWinGeo = new THREE.PlaneGeometry(0.4 * scale, 0.45 * scale);
  const sideWin = new THREE.Mesh(sideWinGeo, windowMat.clone());
  sideWin.position.set(1.26 * scale, 1.2 * scale, 0);
  sideWin.rotation.y = Math.PI / 2;
  group.add(sideWin);

  const chimneyGeo = new THREE.BoxGeometry(0.3 * scale, 0.6 * scale, 0.3 * scale);
  const chimneyMat = new THREE.MeshStandardMaterial({
    color: 0x6a4a3a,
    roughness: 0.9
  });
  const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
  chimney.position.set(0.7 * scale, 3 * scale, -0.3 * scale);
  chimney.castShadow = true;
  group.add(chimney);

  group.position.set(x, 0, z);
  group.rotation.y = rotation;

  return group;
}

const houses = [];
const houseData = [
  { x: -10, z: -4, rot: 0.3, wall: 0xe8d5c4, roof: 0xc45a3a, s: 1 },
  { x: -5, z: -7, rot: -0.2, wall: 0xd4c5b5, roof: 0x5a7a9a, s: 0.9 },
  { x: 3, z: -8, rot: 0.1, wall: 0xe0d0c0, roof: 0xb44a3a, s: 1.1 },
  { x: 8, z: -9, rot: -0.3, wall: 0xd8c8b8, roof: 0x6a5a4a, s: 0.85 },
  { x: -12, z: 5, rot: 0.5, wall: 0xe5d5c5, roof: 0xa44a3a, s: 0.95 },
  { x: 12, z: 5, rot: -0.4, wall: 0xd0c0b0, roof: 0x7a5a4a, s: 1.05 },
];

houseData.forEach(h => {
  const house = createHouse(h.x, h.z, h.rot, h.wall, h.roof, h.s);
  houses.push(house);
  scene.add(house);
});

// Trees
function createTree(x, z, scale = 1) {
  const group = new THREE.Group();

  const trunkGeo = new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 1.2 * scale, 8);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x4a3a2a,
    roughness: 0.9
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.6 * scale;
  trunk.castShadow = true;
  group.add(trunk);

  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x2a5a2a,
    roughness: 0.85
  });

  const foliage1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.8 * scale, 8, 8),
    foliageMat
  );
  foliage1.position.y = 1.8 * scale;
  foliage1.castShadow = true;
  group.add(foliage1);

  const foliage2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.6 * scale, 8, 8),
    foliageMat.clone()
  );
  foliage2.position.set(0.4 * scale, 2.2 * scale, 0.2 * scale);
  foliage2.castShadow = true;
  group.add(foliage2);

  const foliage3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.55 * scale, 8, 8),
    foliageMat.clone()
  );
  foliage3.position.set(-0.3 * scale, 2 * scale, -0.3 * scale);
  foliage3.castShadow = true;
  group.add(foliage3);

  group.position.set(x, 0, z);
  return group;
}

function createPineTree(x, z, scale = 1) {
  const group = new THREE.Group();

  const trunkGeo = new THREE.CylinderGeometry(0.08 * scale, 0.15 * scale, 0.8 * scale, 8);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x3a2a1a,
    roughness: 0.9
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.4 * scale;
  trunk.castShadow = true;
  group.add(trunk);

  const pineMat = new THREE.MeshStandardMaterial({
    color: 0x1a4a1a,
    roughness: 0.9
  });

  for (let i = 0; i < 3; i++) {
    const coneGeo = new THREE.ConeGeometry((0.8 - i * 0.2) * scale, (1 - i * 0.15) * scale, 8);
    const cone = new THREE.Mesh(coneGeo, pineMat);
    cone.position.y = (1.2 + i * 0.6) * scale;
    cone.castShadow = true;
    group.add(cone);
  }

  group.position.set(x, 0, z);
  return group;
}

const trees = [];
const treePositions = [
  [-10, -1, 'round', 1], [-4, -6, 'pine', 1.2], [8, -4, 'round', 0.9],
  [12, -1, 'pine', 1.1], [-12, 5, 'round', 1], [0, 7, 'pine', 1.3],
  [-6, 8, 'round', 0.8], [9, 7, 'pine', 1], [-3, 10, 'round', 1.1],
  [14, 4, 'pine', 0.9], [-14, -4, 'round', 1.2], [3, -8, 'pine', 1],
  [-9, -7, 'round', 0.85], [11, -8, 'pine', 1.1], [-11, 8, 'round', 0.9],
];

treePositions.forEach(([x, z, type, s]) => {
  const tree = type === 'pine' ? createPineTree(x, z, s) : createTree(x, z, s);
  trees.push(tree);
  scene.add(tree);
});

// Street lamps
const lamps = [];
function createStreetLamp(x, z) {
  const group = new THREE.Group();

  const poleGeo = new THREE.CylinderGeometry(0.04, 0.06, 2.5, 8);
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    metalness: 0.7,
    roughness: 0.3
  });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = 1.25;
  pole.castShadow = true;
  group.add(pole);

  const housingGeo = new THREE.CylinderGeometry(0.2, 0.15, 0.3, 8);
  const housingMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.8,
    roughness: 0.2
  });
  const housing = new THREE.Mesh(housingGeo, housingMat);
  housing.position.y = 2.6;
  group.add(housing);

  const glassGeo = new THREE.SphereGeometry(0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xffcc66,
    emissive: 0xffaa33,
    emissiveIntensity: 1,
    transparent: true,
    opacity: 0.9,
    roughness: 0.1,
    metalness: 0.3
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.y = 2.5;
  group.add(glass);

  const lampLight = new THREE.PointLight(0xffaa33, 2, 8);
  lampLight.position.y = 2.5;
  lampLight.castShadow = !isMobile;
  group.add(lampLight);

  group.position.set(x, 0, z);
  return { group, light: lampLight, glass };
}

const lampPositions = [
  [-11, 9], [-9, 7], [-7, 5], [3, -5], [7, -7], [10, 1],
  [-9, 4], [3, 5]
];

lampPositions.forEach(([x, z]) => {
  const lamp = createStreetLamp(x, z);
  lamps.push(lamp);
  scene.add(lamp.group);
});

// Cyclist - completely rebuilt with proper hierarchy
const cyclistGroup = new THREE.Group();

const bikeFrameMat = new THREE.MeshStandardMaterial({
  color: 0xdd4444,
  metalness: 0.6,
  roughness: 0.3
});

const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 });
const chromeMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.2 });
const riderMat = new THREE.MeshStandardMaterial({ color: 0x3a5a8a, roughness: 0.6 });
const skinMat = new THREE.MeshStandardMaterial({ color: 0xddbb99, roughness: 0.5 });
const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2a2a4a, roughness: 0.6 });

// --- BIKE FRAME ---
// Down tube
const downTube = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.05, 8), bikeFrameMat);
downTube.position.set(0.08, 0.62, 0);
downTube.rotation.z = Math.PI / 4.5;
cyclistGroup.add(downTube);

// Seat tube
const seatTube = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.72, 8), bikeFrameMat);
seatTube.position.set(-0.32, 0.65, 0);
seatTube.rotation.z = 0.08;
cyclistGroup.add(seatTube);

// Top tube
const topTube = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.95, 8), bikeFrameMat);
topTube.position.set(0.02, 0.98, 0);
topTube.rotation.z = Math.PI / 2 - 0.12;
cyclistGroup.add(topTube);

// Seat stay (back)
const seatStay = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.75, 6), bikeFrameMat);
seatStay.position.set(-0.35, 0.42, 0);
seatStay.rotation.z = -0.2;
cyclistGroup.add(seatStay);

// Chain stay
const chainStay = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.6, 6), bikeFrameMat);
chainStay.position.set(-0.2, 0.34, 0);
chainStay.rotation.z = Math.PI / 2 + 0.1;
cyclistGroup.add(chainStay);

// Fork
const forkMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8), bikeFrameMat);
forkMesh.position.set(0.48, 0.62, 0);
forkMesh.rotation.z = -0.12;
cyclistGroup.add(forkMesh);

// --- WHEELS ---
const wheelRadius = 0.3;
const wheelGeo = new THREE.TorusGeometry(wheelRadius, 0.025, 8, 24);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.5, roughness: 0.4 });

const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
frontWheel.position.set(0.52, wheelRadius, 0);
frontWheel.rotation.y = Math.PI / 2;
cyclistGroup.add(frontWheel);

const backWheel = new THREE.Mesh(wheelGeo, wheelMat);
backWheel.position.set(-0.52, wheelRadius, 0);
backWheel.rotation.y = Math.PI / 2;
cyclistGroup.add(backWheel);

// Spokes - simple cross pattern per wheel
const spokeMat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.9, roughness: 0.1 });
for (let w = 0; w < 2; w++) {
  const center = w === 0 ? frontWheel.position : backWheel.position;
  // Hub
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), chromeMat);
  hub.position.copy(center);
  cyclistGroup.add(hub);
  // 6 spokes
  for (let s = 0; s < 6; s++) {
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, wheelRadius * 1.8, 4), spokeMat);
    spoke.position.copy(center);
    spoke.rotation.z = (s / 6) * Math.PI;
    spoke.rotation.y = Math.PI / 2;
    cyclistGroup.add(spoke);
  }
}

// --- SEAT ---
const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.12), darkMat);
seatMesh.position.set(-0.35, 1.04, 0);
cyclistGroup.add(seatMesh);

// Seat post
const seatPost = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6), chromeMat);
seatPost.position.set(-0.35, 0.86, 0);
cyclistGroup.add(seatPost);

// --- HANDLEBARS ---
const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8), chromeMat);
handleBar.rotation.x = Math.PI / 2;
handleBar.position.set(0.52, 0.96, 0);
cyclistGroup.add(handleBar);

// Stem
const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.2, 6), chromeMat);
stem.position.set(0.52, 0.88, 0);
stem.rotation.z = -0.15;
cyclistGroup.add(stem);

// --- CRANK SYSTEM (groups that rotate) ---
const crankCenter = new THREE.Vector3(0, 0.32, 0);

// Bottom bracket visual
const bbMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8), chromeMat);
bbMesh.rotation.x = Math.PI / 2;
bbMesh.position.copy(crankCenter);
cyclistGroup.add(bbMesh);

// Left crank group
const leftCrankGroup = new THREE.Group();
leftCrankGroup.position.copy(crankCenter);
cyclistGroup.add(leftCrankGroup);

const leftCrankArm = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.14, 0.02), chromeMat);
leftCrankArm.position.y = 0.07;
leftCrankGroup.add(leftCrankArm);

const leftPedalMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.025, 0.06), darkMat);
leftPedalMesh.position.y = 0.14;
leftCrankGroup.add(leftPedalMesh);

// Right crank group
const rightCrankGroup = new THREE.Group();
rightCrankGroup.position.copy(crankCenter);
cyclistGroup.add(rightCrankGroup);

const rightCrankArm = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.14, 0.02), chromeMat);
rightCrankArm.position.y = 0.07;
rightCrankGroup.add(rightCrankArm);

const rightPedalMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.025, 0.06), darkMat);
rightPedalMesh.position.y = 0.14;
rightCrankGroup.add(rightPedalMesh);

// --- RIDER ---
// Torso
const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.55, 8), riderMat);
torso.position.set(-0.12, 1.18, 0);
torso.rotation.z = 0.35;
torso.castShadow = true;
cyclistGroup.add(torso);

// Head
const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), skinMat);
headMesh.position.set(0.08, 1.55, 0);
headMesh.castShadow = true;
cyclistGroup.add(headMesh);

// Helmet
const helmetMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.14, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  new THREE.MeshStandardMaterial({ color: 0xff5533, metalness: 0.4, roughness: 0.3 })
);
helmetMesh.position.set(0.08, 1.57, 0);
helmetMesh.castShadow = true;
cyclistGroup.add(helmetMesh);

// Arms - reaching to handlebars
const upperArmGeo = new THREE.CylinderGeometry(0.022, 0.02, 0.3, 6);
const forearmGeo = new THREE.CylinderGeometry(0.02, 0.018, 0.28, 6);

const leftUpperArm = new THREE.Mesh(upperArmGeo, riderMat);
leftUpperArm.position.set(0.12, 1.12, 0.1);
leftUpperArm.rotation.z = -0.7;
leftUpperArm.rotation.x = -0.2;
cyclistGroup.add(leftUpperArm);

const leftForearm = new THREE.Mesh(forearmGeo, riderMat);
leftForearm.position.set(0.3, 1.02, 0.1);
leftForearm.rotation.z = -0.3;
leftForearm.rotation.x = -0.4;
cyclistGroup.add(leftForearm);

const rightUpperArm = leftUpperArm.clone();
rightUpperArm.position.z = -0.1;
cyclistGroup.add(rightUpperArm);

const rightForearm = leftForearm.clone();
rightForearm.position.z = -0.1;
cyclistGroup.add(rightForearm);

// Hands
const handGeo = new THREE.SphereGeometry(0.025, 8, 8);
const leftHand = new THREE.Mesh(handGeo, skinMat);
leftHand.position.set(0.45, 0.96, 0.1);
cyclistGroup.add(leftHand);
const rightHand = new THREE.Mesh(handGeo, skinMat);
rightHand.position.set(0.45, 0.96, -0.1);
cyclistGroup.add(rightHand);

// Legs - upper leg groups for hip pivot
const leftHipGroup = new THREE.Group();
leftHipGroup.position.set(-0.15, 0.95, 0.08);
cyclistGroup.add(leftHipGroup);

const leftUpperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.32, 6), pantsMat);
leftUpperLeg.position.y = -0.16;
leftHipGroup.add(leftUpperLeg);

const leftKneeGroup = new THREE.Group();
leftKneeGroup.position.y = -0.32;
leftHipGroup.add(leftKneeGroup);

const leftLowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.025, 0.3, 6), pantsMat);
leftLowerLeg.position.y = -0.15;
leftKneeGroup.add(leftLowerLeg);

const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.03, 0.05), darkMat);
leftFoot.position.set(0.02, -0.31, 0);
leftKneeGroup.add(leftFoot);

// Right leg
const rightHipGroup = new THREE.Group();
rightHipGroup.position.set(-0.15, 0.95, -0.08);
cyclistGroup.add(rightHipGroup);

const rightUpperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.32, 6), pantsMat);
rightUpperLeg.position.y = -0.16;
rightHipGroup.add(rightUpperLeg);

const rightKneeGroup = new THREE.Group();
rightKneeGroup.position.y = -0.32;
rightHipGroup.add(rightKneeGroup);

const rightLowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.025, 0.3, 6), pantsMat);
rightLowerLeg.position.y = -0.15;
rightKneeGroup.add(rightLowerLeg);

const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.03, 0.05), darkMat);
rightFoot.position.set(0.02, -0.31, 0);
rightKneeGroup.add(rightFoot);

cyclistGroup.position.set(-14, 0.05, 14);
cyclistGroup.scale.set(1.1, 1.1, 1.1);
scene.add(cyclistGroup);

// Rocks
function createRock(x, z, scale = 1) {
  const geo = new THREE.DodecahedronGeometry(0.3 * scale, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x6a6a6a,
    roughness: 0.9,
    metalness: 0.1
  });
  const rock = new THREE.Mesh(geo, mat);
  rock.position.set(x, 0.15 * scale, z);
  rock.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5);
  rock.castShadow = true;
  return rock;
}

const rocks = [];
const rockPositions = [
  [-8, 0, 1.2], [-5, 1, 0.8], [3, 2, 1], [7, 0, 0.9],
  [-10, 4, 1.1], [0, 6, 0.7], [5, 5, 1], [-3, -5, 0.8],
  [9, -4, 1.2], [-7, -6, 0.9], [11, 3, 0.8], [-12, -2, 1],
];

rockPositions.forEach(([x, z, s]) => {
  const rock = createRock(x, z, s);
  rocks.push(rock);
  scene.add(rock);
});

// Bushes
function createBush(x, z, scale = 1) {
  const group = new THREE.Group();
  const bushMat = new THREE.MeshStandardMaterial({
    color: 0x2a5a2a,
    roughness: 0.85
  });

  for (let i = 0; i < 3; i++) {
    const bushGeo = new THREE.SphereGeometry((0.3 + Math.random() * 0.2) * scale, 8, 8);
    const bush = new THREE.Mesh(bushGeo, bushMat);
    bush.position.set(
      (Math.random() - 0.5) * 0.5 * scale,
      0.2 * scale,
      (Math.random() - 0.5) * 0.5 * scale
    );
    bush.castShadow = true;
    group.add(bush);
  }

  group.position.set(x, 0, z);
  return group;
}

const bushes = [];
const bushPositions = [
  [-9, -3, 1], [-3, -5, 0.8], [5, -5, 1.1], [11, -2, 0.9],
  [-11, 4, 1], [2, 6, 0.8], [8, 6, 1], [-5, 7, 0.9],
];

bushPositions.forEach(([x, z, s]) => {
  const bush = createBush(x, z, s);
  bushes.push(bush);
  scene.add(bush);
});

// Mountains
function createMountain(x, z, height, width) {
  const geo = new THREE.ConeGeometry(width, height, 6, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x2a2a4a,
    roughness: 0.9,
    flatShading: true
  });
  const mountain = new THREE.Mesh(geo, mat);
  mountain.position.set(x, height / 2 - 2, z);
  return mountain;
}

const mountains = [
  createMountain(-20, -25, 12, 10),
  createMountain(-5, -28, 15, 12),
  createMountain(12, -26, 10, 8),
  createMountain(25, -24, 8, 7),
  createMountain(-30, -22, 9, 9),
];

mountains.forEach(m => scene.add(m));

// Clouds
const clouds = [];
function createCloud(x, y, z, scale = 1) {
  const group = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0x3a3a5a,
    transparent: true,
    opacity: 0.3,
    roughness: 1,
    metalness: 0
  });

  for (let i = 0; i < 5; i++) {
    const size = (0.5 + Math.random() * 0.8) * scale;
    const cloudGeo = new THREE.SphereGeometry(size, 8, 8);
    const cloud = new THREE.Mesh(cloudGeo, cloudMat);
    cloud.position.set(
      (Math.random() - 0.5) * 2 * scale,
      (Math.random() - 0.5) * 0.3 * scale,
      (Math.random() - 0.5) * 1.5 * scale
    );
    group.add(cloud);
  }

  group.position.set(x, y, z);
  return group;
}

const cloudPositions = [
  [-15, 12, -15, 1.5], [5, 14, -20, 2], [20, 11, -12, 1.2],
  [-25, 13, -8, 1.8], [10, 15, -25, 1.6], [-8, 10, -18, 1.3],
];

cloudPositions.forEach(([x, y, z, s]) => {
  const cloud = createCloud(x, y, z, s);
  clouds.push(cloud);
  scene.add(cloud);
});

// Sky dome
const skyGeo = new THREE.SphereGeometry(60, 32, 32);
const skyMat = new THREE.ShaderMaterial({
  uniforms: {
    topColor: { value: new THREE.Color(0x2a1a3a) },
    midColor: { value: new THREE.Color(0x4a2a4a) },
    bottomColor: { value: new THREE.Color(0x3a1a2a) },
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 midColor;
    uniform vec3 bottomColor;
    varying vec3 vWorldPosition;
    void main() {
      float h = normalize(vWorldPosition).y;
      vec3 color;
      if (h > 0.0) {
        color = mix(midColor, topColor, h);
      } else {
        color = mix(bottomColor, midColor, h + 1.0);
      }
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  side: THREE.BackSide
});
const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);

// Fireflies
const fireflyCount = 100;
const fireflyGeo = new THREE.BufferGeometry();
const fireflyPositions = new Float32Array(fireflyCount * 3);
const fireflyBaseY = new Float32Array(fireflyCount);

for (let i = 0; i < fireflyCount; i++) {
  fireflyPositions[i * 3] = (Math.random() - 0.5) * 40;
  fireflyPositions[i * 3 + 1] = Math.random() * 5 + 0.5;
  fireflyPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
  fireflyBaseY[i] = fireflyPositions[i * 3 + 1];
}

fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));

const fireflyMat = new THREE.PointsMaterial({
  color: 0xffcc66,
  size: 0.15,
  transparent: true,
  opacity: 0.7,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true
});

const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
scene.add(fireflies);

// Hanging lightbulb - warm light with sparks
let lightbulbOn = true;
const bulbGlow = document.querySelector('.bulb-glow');
const bulbFilament = document.querySelector('.bulb-filament');
const lightbulb = document.querySelector('.lightbulb');

// 3D point light that illuminates the scene
const bulbPointLight = new THREE.PointLight(0xffb450, 2.5, 30, 1.5);
bulbPointLight.position.set(6, 7, 2);
bulbPointLight.castShadow = !isMobile;
bulbPointLight.shadow.mapSize.width = isMobile ? 512 : 1024;
bulbPointLight.shadow.mapSize.height = isMobile ? 512 : 1024;
scene.add(bulbPointLight);

// Subtle ambient warm wash when bulb is on
const bulbAmbient = new THREE.PointLight(0xff9030, 1.2, 50, 2);
bulbAmbient.position.set(6, 5, 0);
scene.add(bulbAmbient);

// Spark particles around the lightbulb
const sparkCount = 30;
const sparkGeo = new THREE.BufferGeometry();
const sparkPositions = new Float32Array(sparkCount * 3);
const sparkVelocities = [];
const sparkLifetimes = new Float32Array(sparkCount);
const sparkMaxLifetimes = new Float32Array(sparkCount);

const bulbCenter = new THREE.Vector3(6, 6.5, 2);

function resetSpark(i) {
  sparkPositions[i * 3] = bulbCenter.x + (Math.random() - 0.5) * 0.3;
  sparkPositions[i * 3 + 1] = bulbCenter.y + (Math.random() - 0.5) * 0.3;
  sparkPositions[i * 3 + 2] = bulbCenter.z + (Math.random() - 0.5) * 0.3;
  sparkVelocities[i] = {
    x: (Math.random() - 0.5) * 0.02,
    y: Math.random() * 0.03 + 0.01,
    z: (Math.random() - 0.5) * 0.02
  };
  sparkLifetimes[i] = 0;
  sparkMaxLifetimes[i] = Math.random() * 2 + 1;
}

for (let i = 0; i < sparkCount; i++) {
  resetSpark(i);
  sparkLifetimes[i] = Math.random() * sparkMaxLifetimes[i];
}

sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));

const sparkMat = new THREE.PointsMaterial({
  color: 0xffdd88,
  size: 0.08,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true
});

const sparks = new THREE.Points(sparkGeo, sparkMat);
scene.add(sparks);

// Set initial warm state
if (bulbGlow) {
  bulbGlow.style.background = 'radial-gradient(circle, rgba(255,180,80,0.85) 0%, rgba(255,140,40,0.4) 40%, transparent 70%)';
  bulbGlow.style.boxShadow = '0 0 60px 30px rgba(255,180,80,0.5), 0 0 120px 60px rgba(255,140,40,0.25)';
  bulbFilament.style.background = '#ffdd55';
  bulbFilament.style.boxShadow = '0 0 15px 6px rgba(255,200,60,0.7), 0 0 30px 12px rgba(255,180,80,0.4)';
  lightbulb.classList.add('active');
}

if (lightbulb) {
  lightbulb.style.cursor = 'pointer';
  lightbulb.addEventListener('click', () => {
    lightbulbOn = !lightbulbOn;
    if (lightbulbOn) {
      bulbGlow.style.background = 'radial-gradient(circle, rgba(255,180,80,0.95) 0%, rgba(255,140,40,0.5) 40%, transparent 70%)';
      bulbGlow.style.boxShadow = '0 0 80px 40px rgba(255,180,80,0.7), 0 0 160px 80px rgba(255,140,40,0.35)';
      bulbFilament.style.background = '#ffdd55';
      bulbFilament.style.boxShadow = '0 0 20px 8px rgba(255,200,60,0.9), 0 0 40px 15px rgba(255,180,80,0.5)';
      lightbulb.classList.add('active');
      bulbPointLight.intensity = 3;
      bulbAmbient.intensity = 1.5;
    } else {
      bulbGlow.style.background = 'radial-gradient(circle, rgba(255,200,100,0.15) 0%, transparent 60%)';
      bulbGlow.style.boxShadow = 'none';
      bulbFilament.style.background = 'rgba(255,200,100,0.3)';
      bulbFilament.style.boxShadow = 'none';
      lightbulb.classList.remove('active');
      bulbPointLight.intensity = 0;
      bulbAmbient.intensity = 0;
    }
  });
}

// Mouse parallax
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = (e.clientY / window.innerHeight) * 2 - 1;
});

// 360 rotation state
let autoRotate = true;
let rotationAngle = 0;
const rotationSpeed = 0.08; // radians per second for full 360
const cameraDistance = 22;
const cameraHeight = 8;
const cameraTarget = new THREE.Vector3(0, 2, 0);

// Warm rain system
const rainCount = isMobile ? 300 : 800;
const rainGeo = new THREE.BufferGeometry();
const rainPositions = new Float32Array(rainCount * 3);
const rainVelocities = new Float32Array(rainCount);
const rainDropLengths = new Float32Array(rainCount);

for (let i = 0; i < rainCount; i++) {
  rainPositions[i * 3] = (Math.random() - 0.5) * 50;
  rainPositions[i * 3 + 1] = Math.random() * 30;
  rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
  rainVelocities[i] = Math.random() * 0.3 + 0.4;
  rainDropLengths[i] = Math.random() * 0.3 + 0.15;
}

rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

const rainMat = new THREE.PointsMaterial({
  color: 0xffcc88,
  size: 0.06,
  transparent: true,
  opacity: 0.35,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true
});

const rain = new THREE.Points(rainGeo, rainMat);
scene.add(rain);

// Warm wind streaks
const windStreakCount = isMobile ? 15 : 40;
const windGeo = new THREE.BufferGeometry();
const windPositions = new Float32Array(windStreakCount * 3);
const windSpeeds = new Float32Array(windStreakCount);
const windLifetimes = new Float32Array(windStreakCount);

function resetWind(i) {
  windPositions[i * 3] = -25 + Math.random() * 10;
  windPositions[i * 3 + 1] = Math.random() * 12 + 1;
  windPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  windSpeeds[i] = Math.random() * 0.15 + 0.08;
  windLifetimes[i] = 0;
}

for (let i = 0; i < windStreakCount; i++) {
  resetWind(i);
  windLifetimes[i] = Math.random() * 5;
}

windGeo.setAttribute('position', new THREE.BufferAttribute(windPositions, 3));

const windMat = new THREE.PointsMaterial({
  color: 0xffddaa,
  size: 0.12,
  transparent: true,
  opacity: 0.2,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true
});

const windStreaks = new THREE.Points(windGeo, windMat);
scene.add(windStreaks);

// Lightning system
let lightningFlash = 0;
let lightningTimer = Math.random() * 5 + 3;
let lightningDuration = 0;
let lightningFlicker = 0;

const lightningLight = new THREE.PointLight(0xffeedd, 0, 80, 1);
lightningLight.position.set(0, 18, -10);
scene.add(lightningLight);

const lightningLight2 = new THREE.PointLight(0xffddbb, 0, 60, 1.5);
lightningLight2.position.set(-10, 16, -5);
scene.add(lightningLight2);

// Lightning cloud (darker, charged cloud)
const lightningCloudGroup = new THREE.Group();
const stormCloudMat = new THREE.MeshStandardMaterial({
  color: 0x2a1a2a,
  transparent: true,
  opacity: 0.5,
  roughness: 1,
  metalness: 0
});

for (let i = 0; i < 8; i++) {
  const size = 1 + Math.random() * 1.5;
  const stormGeo = new THREE.SphereGeometry(size, 8, 8);
  const stormCloud = new THREE.Mesh(stormGeo, stormCloudMat);
  stormCloud.position.set(
    (Math.random() - 0.5) * 4,
    (Math.random() - 0.5) * 0.5,
    (Math.random() - 0.5) * 2
  );
  lightningCloudGroup.add(stormCloud);
}

lightningCloudGroup.position.set(0, 16, -15);
scene.add(lightningCloudGroup);

// Cloud flash material for lightning cloud
const cloudFlashMat = new THREE.MeshStandardMaterial({
  color: 0xffeedd,
  transparent: true,
  opacity: 0,
  emissive: 0xffcc88,
  emissiveIntensity: 0,
  roughness: 1
});

const flashCloud = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), cloudFlashMat);
flashCloud.position.set(0, 16, -15);
scene.add(flashCloud);

// Animation
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  // Camera: 360 auto-rotation + subtle mouse parallax offset
  rotationAngle += rotationSpeed * 0.016;
  if (rotationAngle > Math.PI * 2) rotationAngle -= Math.PI * 2;

  // Mouse parallax as offset from the orbit position
  const parallaxX = mouseX * 1.5;
  const parallaxY = -mouseY * 1;

  camera.position.x = Math.sin(rotationAngle) * cameraDistance + parallaxX;
  camera.position.z = Math.cos(rotationAngle) * cameraDistance;
  camera.position.y = cameraHeight + parallaxY + Math.sin(time * 0.15) * 0.5;
  camera.lookAt(cameraTarget);

  // Cyclist animation - smooth pedaling with proper hierarchy
  const t = (time * 0.06) % 1;
  const cyclistPos = pathCurve.getPoint(t);
  const cyclistTangent = pathCurve.getTangent(t);

  cyclistGroup.position.set(cyclistPos.x, 0.05, cyclistPos.z);
  cyclistGroup.rotation.y = Math.atan2(cyclistTangent.x, cyclistTangent.z);

  // Wheel spin + pedal rotation
  const wheelAngle = time * 2.5;
  frontWheel.rotation.x = wheelAngle;
  backWheel.rotation.x = wheelAngle;

  // Crank groups rotate around Z axis (bike-local)
  leftCrankGroup.rotation.z = wheelAngle;
  rightCrankGroup.rotation.z = wheelAngle + Math.PI;

  // Leg IK - hips pivot to follow pedals
  const hipAngleL = Math.sin(wheelAngle) * 0.4;
  const hipAngleR = Math.sin(wheelAngle + Math.PI) * 0.4;
  const kneeAngleL = -0.3 - Math.cos(wheelAngle) * 0.5;
  const kneeAngleR = -0.3 - Math.cos(wheelAngle + Math.PI) * 0.5;

  leftHipGroup.rotation.x = hipAngleL;
  leftKneeGroup.rotation.x = kneeAngleL;
  rightHipGroup.rotation.x = hipAngleR;
  rightKneeGroup.rotation.x = kneeAngleR;

  // Rider subtle bob
  const bobAmount = Math.sin(time * 5) * 0.008;
  torso.position.y = 1.18 + bobAmount;
  headMesh.position.y = 1.55 + bobAmount;
  helmetMesh.position.y = 1.57 + bobAmount;

  // Lamp glow pulse
  lamps.forEach((lamp, i) => {
    const pulse = Math.sin(time * 1.5 + i * 0.8) * 0.2 + 0.8;
    lamp.light.intensity = pulse * 2;
    lamp.glass.material.emissiveIntensity = pulse;
  });

  // Window glow - twinkling
  houses.forEach((house, hi) => {
    house.children.forEach(child => {
      if (child.material && child.material.emissive) {
        child.material.emissiveIntensity = 0.6 + Math.sin(time * 1.2 + hi * 1.5) * 0.25;
      }
    });
  });

  // Tree sway
  trees.forEach((tree, i) => {
    tree.rotation.z = Math.sin(time * 0.4 + i * 0.5) * 0.025;
    tree.rotation.x = Math.cos(time * 0.3 + i * 0.7) * 0.01;
  });

  // Cloud drift
  clouds.forEach((cloud, i) => {
    cloud.position.x += Math.sin(time * 0.05 + i) * 0.003;
    cloud.position.y += Math.cos(time * 0.03 + i * 0.5) * 0.001;
  });

  // Firefly drift
  const ffPos = fireflies.geometry.attributes.position.array;
  for (let i = 0; i < fireflyCount; i++) {
    ffPos[i * 3] += Math.sin(time * 0.5 + i * 0.3) * 0.004;
    ffPos[i * 3 + 1] = fireflyBaseY[i] + Math.sin(time * 0.8 + i * 0.5) * 0.3;
    ffPos[i * 3 + 2] += Math.cos(time * 0.4 + i * 0.4) * 0.003;
  }
  fireflies.geometry.attributes.position.needsUpdate = true;
  fireflyMat.opacity = 0.5 + Math.sin(time * 2) * 0.25;

  // Spark particles animation
  if (lightbulbOn) {
    const spPos = sparks.geometry.attributes.position.array;
    for (let i = 0; i < sparkCount; i++) {
      sparkLifetimes[i] += 0.016;
      if (sparkLifetimes[i] > sparkMaxLifetimes[i]) {
        resetSpark(i);
      }
      const lifeRatio = sparkLifetimes[i] / sparkMaxLifetimes[i];
      spPos[i * 3] += sparkVelocities[i].x;
      spPos[i * 3 + 1] += sparkVelocities[i].y;
      spPos[i * 3 + 2] += sparkVelocities[i].z;
      // Fade out near end of life
      sparkVelocities[i].y *= 0.99;
    }
    sparks.geometry.attributes.position.needsUpdate = true;
    sparkMat.opacity = 0.7 + Math.sin(time * 3) * 0.2;
  } else {
    sparkMat.opacity = 0;
  }

  // Warm rain animation
  const rPos = rain.geometry.attributes.position.array;
  for (let i = 0; i < rainCount; i++) {
    rPos[i * 3 + 1] -= rainVelocities[i];
    // Wind drift
    rPos[i * 3] += Math.sin(time * 0.5 + i * 0.01) * 0.01;
    rPos[i * 3 + 2] += Math.cos(time * 0.3 + i * 0.02) * 0.005;
    // Reset when below ground
    if (rPos[i * 3 + 1] < 0) {
      rPos[i * 3] = (Math.random() - 0.5) * 50;
      rPos[i * 3 + 1] = 25 + Math.random() * 5;
      rPos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
  }
  rain.geometry.attributes.position.needsUpdate = true;
  rainMat.opacity = 0.25 + Math.sin(time * 0.8) * 0.1;

  // Warm wind streaks
  const wPos = windStreaks.geometry.attributes.position.array;
  for (let i = 0; i < windStreakCount; i++) {
    windLifetimes[i] += 0.016;
    wPos[i * 3] += windSpeeds[i];
    wPos[i * 3 + 1] += Math.sin(time + i) * 0.005;
    if (wPos[i * 3] > 25 || windLifetimes[i] > 5) {
      resetWind(i);
    }
  }
  windStreaks.geometry.attributes.position.needsUpdate = true;
  windMat.opacity = 0.15 + Math.sin(time * 0.6) * 0.08;

  // Lightning system
  lightningTimer -= 0.016;
  if (lightningTimer <= 0 && lightningDuration <= 0) {
    // Trigger lightning
    lightningDuration = 0.15 + Math.random() * 0.1;
    lightningFlicker = 0;
    lightningCloudGroup.position.x = (Math.random() - 0.5) * 20;
    lightningCloudGroup.position.z = -15 + (Math.random() - 0.5) * 10;
    flashCloud.position.copy(lightningCloudGroup.position);
    lightningLight.position.copy(lightningCloudGroup.position);
    lightningLight.position.y = 16;
    lightningLight2.position.copy(lightningCloudGroup.position);
    lightningLight2.position.y = 14;
    lightningTimer = Math.random() * 8 + 4;
  }

  if (lightningDuration > 0) {
    lightningDuration -= 0.016;
    lightningFlicker += 1;
    const flick = Math.sin(lightningFlicker * 20) > 0 ? 1 : 0.2;
    lightningLight.intensity = 15 * flick;
    lightningLight2.intensity = 10 * flick;
    cloudFlashMat.opacity = 0.6 * flick;
    cloudFlashMat.emissiveIntensity = 2 * flick;
    flashCloud.position.copy(lightningCloudGroup.position);
    // Flash CSS overlay
    const flashEl = document.querySelector('.lightning-flash');
    if (flashEl) flashEl.style.opacity = flick;
  } else {
    lightningLight.intensity *= 0.9;
    lightningLight2.intensity *= 0.9;
    cloudFlashMat.opacity *= 0.9;
    cloudFlashMat.emissiveIntensity *= 0.9;
    const flashEl = document.querySelector('.lightning-flash');
    if (flashEl) flashEl.style.opacity *= 0.85;
  }

  // Lightning cloud drift
  lightningCloudGroup.position.x += Math.sin(time * 0.1) * 0.005;
  flashCloud.position.x = lightningCloudGroup.position.x;
  flashCloud.position.z = lightningCloudGroup.position.z;

  // Wind effect on trees (stronger sway)
  trees.forEach((tree, i) => {
    const windForce = Math.sin(time * 0.8 + i * 0.3) * 0.04;
    tree.rotation.z = windForce + Math.sin(time * 0.4 + i * 0.5) * 0.02;
    tree.rotation.x = Math.cos(time * 0.3 + i * 0.7) * 0.015;
  });

  renderer.render(scene, camera);
}

animate();

// Resize (debounced)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 150);
});

// Nav interactions
document.querySelectorAll('.nav-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

document.querySelectorAll('.node-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    document.querySelectorAll('.node-dot').forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
  });
});

// Hero card - handled by CSS animation

// CTA button glow hover
const ctaBtn = document.querySelector('.cta-btn');
if (ctaBtn) {
  ctaBtn.addEventListener('mouseenter', () => {
    ctaBtn.style.boxShadow = '0 0 30px rgba(255,107,74,0.5), 0 0 60px rgba(255,140,40,0.2)';
    ctaBtn.style.transform = 'translateY(-3px)';
  });
  ctaBtn.addEventListener('mouseleave', () => {
    ctaBtn.style.boxShadow = '0 4px 20px rgba(255, 107, 74, 0.3)';
    ctaBtn.style.transform = 'translateY(0)';
  });
}

// Floating animation for nav pills
document.querySelectorAll('.nav-pill').forEach((pill, i) => {
  pill.style.animation = `float ${3 + i * 0.3}s ease-in-out infinite`;
  pill.style.animationDelay = `${i * 0.2}s`;
});
