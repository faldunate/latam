"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Menu } from "antd";
import {
  DownloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  UpCircleOutlined,
  DownCircleOutlined,
  LeftCircleOutlined,
  RightCircleOutlined,
  CodeSandboxOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const InteractiveGrid = () => {
  const mountRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null); // Almacena el objeto seleccionado
  let renderer, camera, scene, controls, clock, raycaster;
  const sceneRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    init();
    animate();

    return () => {
      cancelAnimationFrame(animate);
      if (renderer) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const init = () => {
    clock = new THREE.Clock();

    // Verificar si se está inicializando correctamente la cámara y la escena
    camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    camera.position.set(500, 800, 1300);
    camera.lookAt(0, 0, 0);
    console.log("Camera initialized:", camera);

    sceneRef.current.background = new THREE.Color(0xf0f0f0);
    console.log("Scene initialized:", sceneRef.current);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.minDistance = 100;
    controls.maxDistance = 5000;
    controls.maxPolarAngle = Math.PI / 2;

    const gridHelper = new THREE.GridHelper(1000, 20);
    sceneRef.current.add(gridHelper);

    const ambientLight = new THREE.AmbientLight(0x606060, 3);
    sceneRef.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    sceneRef.current.add(directionalLight);

    raycaster = new THREE.Raycaster();

    window.addEventListener("resize", onWindowResize);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    addLogoToWall("/LATAMLOGO.svg", { x: 0, y: 100, z: -500 });
  };

  const addLogoToWall = (logoUrl, position = { x: 0, y: 50, z: 0 }) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      logoUrl,
      function (texture) {
        // Crear una geometría de plano para representar la "pared"
        const geometry = new THREE.PlaneGeometry(200, 100); // Ajusta el tamaño del plano
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide, // Se verá desde ambos lados
          transparent: true, // Si el SVG convertido tiene transparencia
        });
        const plane = new THREE.Mesh(geometry, material);

        // Posicionar el plano sobre la grilla
        plane.position.set(position.x, position.y, position.z);

        // Rotar el plano para que el logo esté mirando hacia la grilla correctamente
        plane.rotation.x = 0;  // Rota 180 grados en el eje X para que no esté boca abajo

        // Añadir el plano a la escena
        sceneRef.current.add(plane);
        console.log("Logo añadido a la pared, orientado hacia la grilla:", plane);
      },
      undefined,
      function (error) {
        console.error("Error al cargar la textura:", error);
      }
    );
  };

  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(sceneRef.current, camera);
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const onPointerDown = (event) => {
    const pointer = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    const filteredIntersects = intersects.filter(intersect => intersect.object.type !== 'GridHelper');
    console.log("Intersecciones:", intersects.map(intersect => intersect.object));
    if (filteredIntersects.length > 0) {
      let selectedModel = filteredIntersects[0].object;
      console.log("Modelo seleccionado:", selectedModel);

      while (selectedModel.parent && selectedModel.parent.type !== "Scene") {
        selectedModel = selectedModel.parent;
      }

      console.log("Modelo seleccionado:", selectedModel);
      if (selectedObject !== selectedModel) {
        setSelectedObject(selectedModel); // Solo cambiar si es un objeto diferente
        console.log("Modelo seleccionado:", selectedModel);
      }
    } else {
      console.log("No se seleccionó ningún modelo");
    }
  };

  const onPointerUp = () => {
    // Detener cualquier acción relacionada con el arrastre aquí si se agrega
  };

  const rotateSelectedLeft = () => {
    if (selectedObject) {
      selectedObject.rotation.y += Math.PI / 4; // Rotar 45 grados a la izquierda
      console.log("Rotar a la izquierda", selectedObject.rotation.y);
    }
  };

  const rotateSelectedRight = () => {
    if (selectedObject) {
      selectedObject.rotation.y -= Math.PI / 4; // Rotar 45 grados a la derecha
      console.log("Rotar a la derecha", selectedObject.rotation.y);
    }
  };

  // Funciones para mover el objeto seleccionado
  const moveUp = () => {
    if (selectedObject) {
      selectedObject.position.z -= 10; // Mueve el objeto hacia arriba
      console.log("Objeto movido hacia arriba:", selectedObject.position);
    }
  };

  const moveDown = () => {
    if (selectedObject) {
      selectedObject.position.z += 10; // Mueve el objeto hacia abajo
      console.log("Objeto movido hacia abajo:", selectedObject.position);
    }
  };

  const moveLeft = () => {
    if (selectedObject) {
      selectedObject.position.x -= 10; // Mueve el objeto hacia la izquierda
      console.log("Objeto movido hacia la izquierda:", selectedObject.position);
    }
  };

  const moveRight = () => {
    if (selectedObject) {
      selectedObject.position.x += 10; // Mueve el objeto hacia la derecha
      console.log("Objeto movido hacia la derecha:", selectedObject.position);
    }
  };

  const removeObject = () => {
    if (selectedObject) {
      sceneRef.current.remove(selectedObject);
      console.log("Objeto eliminado de la escena:", selectedObject);
    }
  };

  const loadModel = (url, position = { x: 0, y: 0, z: 0 }) => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      function (gltf) {
        const model = gltf.scene;
        model.scale.set(50, 50, 50);
        model.position.set(0, 0, 0);  // Model centrado dentro del grupo
        model.rotation.set(0, 0, 0);

        // Crear un grupo que contendrá el modelo y la caja envolvente
        const group = new THREE.Group();
        group.position.set(position.x, position.y, position.z);  // Este será el pivote para la rotación
        group.add(model);

        // Crear un BoxHelper para envolver todo el modelo
        const boxHelper = new THREE.BoxHelper(model, 0xffff00);
        boxHelper.visible = false; // Hacer la caja invisible
        group.add(boxHelper); // Añadir la caja de colisión al grupo

        group.name = `model_${Math.random().toString(36).substr(2, 9)}`;

        // Añadir el grupo a la escena
        sceneRef.current.add(group);
        console.log("Modelo cargado y añadido a la escena:", group);
      },
      undefined,
      function (error) {
        console.error("Error al cargar el modelo:", error);
      }
    );
  };

  const cleanSelectedObject = () => {
    setSelectedObject(null);
  }

  return (
    <div>
      <div style={{position: 'absolute', width: 150}}>

        <Menu
          mode="inline"
          style={{ width: 256 }}
        >
          {
            selectedObject
            ? (
              <>
                <Menu.Item
                  key="5"
                  onClick={() => cleanSelectedObject()}
                  icon={<DownloadOutlined />}
                >
                  Limpiar selección
                </Menu.Item>

                <Menu.Item
                  key="6"
                  onClick={rotateSelectedLeft}
                  icon={<RotateLeftOutlined />}
                >
                  Rotar Izquierda
                </Menu.Item>

                <Menu.Item
                  key="7"
                  onClick={rotateSelectedRight}
                  icon={<RotateRightOutlined />}
                >
                  Rotar Derecha
                </Menu.Item>

                <Menu.Item
                  key="8"
                  onClick={moveUp}
                  icon={<UpCircleOutlined />}
                >
                  Mover Arriba
                </Menu.Item>

                <Menu.Item
                  key="9"
                  onClick={moveDown}
                  icon={<DownCircleOutlined />}
                >
                  Mover Abajo
                </Menu.Item>

                <Menu.Item
                  key="10"
                  onClick={moveLeft}
                  icon={<LeftCircleOutlined />}
                >
                  Mover Izquierda
                </Menu.Item>

                <Menu.Item
                  key="11"
                  onClick={moveRight}
                  icon={<RightCircleOutlined />}
                >
                  Mover Derecha
                </Menu.Item>

                <Menu.Item
                  key="12"
                  onClick={() => removeObject()}
                  icon={<DeleteOutlined />}
                >
                  Eliminar objeto
                </Menu.Item>
              </>
            )
            : (
              <>
                <Menu.Item
                  key="1"
                  icon={<CodeSandboxOutlined />}
                  onClick={() => loadModel("/TESTPI_02.gltf", { x: 0, y: 0, z: 0 })}
                >
                  Totem
                </Menu.Item>

                <Menu.Item
                  key="2"
                  icon={<CodeSandboxOutlined />}
                  onClick={() => loadModel("/LOBBYCOUNTER.gltf", { x: 100, y: 0, z: 0 })}
                >
                  Lobby Counter
                </Menu.Item>

                <Menu.Item
                  key="3"
                  icon={<CodeSandboxOutlined />}
                  onClick={() => loadModel("/PLACAIMANTADA_PR.gltf", { x: 200, y: 0, z: 0 })}
                >
                  Placa Imantada
                </Menu.Item>

                <Menu.Item
                  key="4"
                  icon={<CodeSandboxOutlined />}
                  onClick={() => loadModel("/TENSABARRIER_02.gltf", { x: 300, y: 0, z: 0 })}
                >
                  Tensa Barrier
                </Menu.Item>
              </>
            )
          }
        </Menu>
      </div>
      <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />
    </div>
  );
};

export default InteractiveGrid;