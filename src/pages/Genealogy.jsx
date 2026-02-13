import icons from "../assets/icons/icons";
import { useEffect, useState, useRef } from "react";
import ReactToPrint from "react-to-print";
import handlePrint from "../printerComponent";
import BrowserPrintComponent from "../printerComponent";
import { notifyError } from "../partials/paletization/Toasts";

import {
  Add,
  Barcode,
  Box,
  Box1,
  Category,
  Cd,
  CopySuccess,
  FormatSquare,
  Grid8,
  Hashtag,
  HashtagSquare,
  Health,
  Notepad2,
  Scan,
} from "iconsax-react";

import Stepper from "@keyvaluesystems/react-vertical-stepper";

import GraphicHistory from "../partials/paletization/GraphicHistory";

import useScanDetection from "use-scan-detection";

import { useSelector, useDispatch } from "react-redux";

import {
  selectOrderSelected,
  metadataOrderSelected,
} from "../store/slice/orderSelectedSlice";

import {
  selectGenealogyLog,
  addEventToGenealogyLog,
} from "../store/slice/eventsLogSlice";
import {
  getTestResults,
  selectTestResults,
  selectGlobalStatus,
  setTestResults,
  setGlobalStatus,
} from "../store/slice/testResultSlice";
import LabelPrinting from "../partials/genealogy/LabelPrinting";
import {
  notifyCondenserScanned,
  notifyProductScanned,
} from "../partials/paletization/Toasts";
import ModalBlank from "../components/ModalBlank";
import ModalAction from "../components/ModalAction";
import {
  joinComponents,
  selectChartDataOrderProgress,
  selectComponentsCount,
  selectComponentsJoined,
  setChartDataOrderProgress,
  setComponentsJoined,
} from "../store/slice/palletsSlice";
import ComponentsTable from "../partials/genealogy/ComponentsTable";
import PolarChart from "../charts/PolarChart";
import { hexToRGB, tailwindConfig } from "../utils/Utils";
import BarChart04 from "../charts/BarChart04";

function GenealogyDashboard() {
  const testResultsList = useSelector(selectTestResults);
  const globalStatus = useSelector(selectGlobalStatus);
  const orderSelected = useSelector(selectOrderSelected);
  const metadata = useSelector(metadataOrderSelected);
  const genealogyLog = useSelector(selectGenealogyLog);
  const componentsJoined = useSelector(selectComponentsJoined);
  const componentsCount = useSelector(selectComponentsCount);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const [hasChildrenAssociated, setHasChildrenAssociated] = useState(false);

  const [mode, setMode] = useState("compressor");

  const [barcodeProduct, setBarcodeProduct] = useState("Escanea compresor");
  const [barcodeCondenser, setBarcodeCondenser] = useState(
    "Escanea condensador"
  );

  const [treeData, setTreeData] = useState([]);

  const dispatch = useDispatch();

  const labelRef = useRef();

  const [currentStepIndexUnion, setCurrentStepIndexUnion] = useState(1);

  const [chartData, setChartData] = useState({
    labels: [""],
    datasets: [
      // Blue bars
      {
        label: "Planeado",
        data: [0],
        backgroundColor: tailwindConfig().theme.colors.blue[500],
        hoverBackgroundColor: tailwindConfig().theme.colors.indigo[600],
        categoryPercentage: 0.66,
      },
      // Light blue bars
      {
        label: "Apuntado",
        data: [0],
        backgroundColor: tailwindConfig().theme.colors.sky[400],
        hoverBackgroundColor: tailwindConfig().theme.colors.sky[500],
        categoryPercentage: 0.66,
      },
      {
        label: "Realizado",
        data: [0],
        backgroundColor: "#009B4A",
        hoverBackgroundColor: "#009B4A",
        categoryPercentage: 0.66,
      },
    ],
  });

  useEffect(() => {
    // Actualizar las etiquetas cuando orderSelected.aufnr cambie
    console.log("Cambió");
    const newOrder = orderSelected.aufnr;
    console.log(newOrder);
    //setChartData();

    console.log("New chartData");
    console.log(chartData);
  }, [orderSelected]);

  const stepsUnion = [
    {
      label: "Compresor",
      description: barcodeProduct,
      status: "visited",
    },
    {
      label: "Condensador",
      description: barcodeCondenser,
      status: "visited",
    },
  ];

  useScanDetection({
    onComplete: (code) => {
      let codeFormat = code.replace(/Shift/g, "").toUpperCase();

      let condensator_code = orderSelected.matnr.slice(9);
      let compressor_code = orderSelected.components[0].matnr.slice(0,9) ?? "";

      // console.log({codeFormat,compresorCode});
      // if (!codeFormat.startsWith(compresorCode)) {
      //   notifyError("El producto escaneado no corresponde con el de la orden");
      //   return;
      // }

      if (code.replace(/Shift/g, "").toUpperCase() === "NEW") {
        console.log("Comando NEW detectado");
        handleNew();
        return;
      }
      if (mode === "compressor") {
        console.log({codeFormat,compressor_code});
        if (!codeFormat.startsWith(compressor_code)) {
          notifyError(
            `El producto escaneado no es un compresor. ${codeFormat} != ${compressor_code}`
          );
          return;
        }
        const codeScannedEvent = {
          text:
            "Compresor escaneado: " + code.replace(/Shift/g, "").toUpperCase(),
          timestamp: new Date().toISOString(),
        };
        notifyProductScanned(code.replace(/Shift/g, "").toUpperCase());
        setBarcodeProduct(code.replace(/Shift/g, "").toUpperCase());
        setInfoModalOpen(true);
        dispatch(addEventToGenealogyLog(codeScannedEvent));
        setMode("condenser");
      } else if (mode === "condenser") {
        if (!codeFormat.startsWith(condensator_code)) {
          notifyError(
            `El producto escaneado no es un condensador. ${codeFormat} != ${condensator_code}`
          );
          return;
        }
        const codeScannedEvent = {
          text:
            "Condensador escaneado: " +
            code.replace(/Shift/g, "").toUpperCase(),
          timestamp: new Date().toISOString(),
        };
        setBarcodeCondenser(code.replace(/Shift/g, "").toUpperCase());
        notifyCondenserScanned(code.replace(/Shift/g, "").toUpperCase());
        dispatch(getTestResults(code.replace(/Shift/g, "").toUpperCase()));
        dispatch(addEventToGenealogyLog(codeScannedEvent));
        const getCondenserTestResultsEvent = {
          text:
            "Consultando resultados de prueba de condensador: " +
            code.replace(/Shift/g, "").toUpperCase(),
          timestamp: new Date().toISOString(),
        };
        dispatch(addEventToGenealogyLog(getCondenserTestResultsEvent));
      }
    },
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  var stepsArray = [
    {
      label: "Prueba eléctrica",
      description: "Aprobada, sin errores, finalizada hace 14 minutos.",
      status: "visited",
    },
    {
      label: "Prueba de vacío",
      description: "En proceso, iniciada el 9/05/2023 a las 12:30 PM.",
      status: "unvisited",
    },
  ];

  function formatTimestampToDDMMYYYYHHMMSS(timestamp) {
    const date = new Date(timestamp);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  const stylesOverrideUnion = {
    LabelTitle: (step, stepIndex) => ({
      marginLeft: "8px",
      fontSize: 16,
      textAlign: "start",
    }),
    ActiveLabelTitle: (step, stepIndex) => ({
      marginLeft: "-0px",
      textAlign: "start",
      fontSize: 16,
      fontWeight: "500",
      color: "black",
    }),
    LabelDescription: (step, stepIndex) => ({
      marginLeft: "8px",
      fontSize: 14,
    }),
    ActiveLabelDescription: (step, stepIndex) => ({
      marginLeft: "0px",
      fontSize: 14,
    }),
    LineSeparator: (step, stepIndex) => ({ borderRight: "2px solid #dfdff2" }),
    InactiveLineSeparator: (step, stepIndex) => ({
      borderRight: "2px solid #dfdff2",
    }),

    Bubble: (step, stepIndex) => (
      console.log(stepIndex),
      {
        width: "40px",
        height: "40px",
        backgroundColor: step.status === "skipped" ? "red" : "#15B053",
        color: "#fff",
      }
    ),
    ActiveBubble: (step, stepIndex) => ({
      width: "40px",
      height: "40px",
      backgroundColor: step.status === "skipped" ? "red" : "#15B053",
      color: "#fff",
      background: "#15B053",
      border:
        step.status === "skipped" ? "7px solid #ee9090" : "7px solid #A1DFBA",
    }),
    InActiveBubble: (step, stepIndex) => ({
      width: "40px",
      height: "40px",
      backgroundColor: "#F0F1F3",
      color: "#000000",
    }),
  };

  const stylesOverride = {
    LabelTitle: (step, stepIndex) => ({ marginLeft: "8px", fontSize: 15 }),
    ActiveLabelTitle: (step, stepIndex) => ({
      marginLeft: "0px",
      fontSize: 15,
    }),
    LabelDescription: (step, stepIndex) => ({
      marginLeft: "8px",
      fontSize: 13,
    }),
    ActiveLabelDescription: (step, stepIndex) => ({
      marginLeft: "0px",
      fontSize: 13,
    }),
    LineSeparator: (step, stepIndex) => ({ borderRight: "2px solid #dfdff2" }),
    InactiveLineSeparator: (step, stepIndex) => ({
      borderRight: "2px solid #dfdff2",
    }),
    Bubble: (step, stepIndex) => (
      console.log(stepIndex === currentStepIndex),
      console.log(step.status),
      {
        width: "40px",
        height: "40px",
        backgroundColor: step.status === "unvisited" ? "#E81A1A" : "#15B053",
        color: "#fff",
        background: step.status === "unvisited" ? "#E81A1A" : "#15B053",
      }
    ),
    ActiveBubble: (step, stepIndex) => ({
      width: "40px",
      height: "40px",
      backgroundColor: step.status === "unvisited" ? "#E81A1A" : "#15B053",
      color: "#fff",
      background: "#15B053",
      border:
        step.status === "unvisited" ? "7px solid #ee9090" : "7px solid #A1DFBA",
    }),
    InActiveBubble: (step, stepIndex) => ({
      width: "40px",
      height: "40px",
      backgroundColor: "#E81A1A",
      color: "white",
    }),
  };

  function handleStepClickUnion(step, stepIndex) {
    if (stepIndex === 0) {
      console.log("Modo Compresor");
      setMode("compressor");
    } else if (stepIndex === 1) {
      console.log("Modo condensador");
      setMode("condenser");
    }
    setCurrentStepIndexUnion(stepIndex);
  }

  function handleNew() {
    console.log("Handle new step");
    setMode("compressor");
    setBarcodeProduct("Escanea compresor");
    setBarcodeCondenser("Escanea condesador");
    dispatch(setGlobalStatus(""));
    dispatch(setTestResults([]));
    dispatch(setComponentsJoined(false));
    const handleNewEvent = {
      text: "Comando NUEVO detectado. Proceso reiniciado.",
      timestamp: new Date().toISOString(),
    };
    dispatch(addEventToGenealogyLog(handleNewEvent));
  }

  function buildTreeData(obj) {
    if (typeof obj === "undefined" || Object.keys(obj).length === 0) {
      console.log("Boom undefined");
      return [];
    } else {
      const treeData = [];
      const mainMatnr = obj.matnr.slice(-9); // Obtener los últimos 9 caracteres de matnr

      const parentNode = {
        id: 1,
        label: mainMatnr,
        children: [],
      };

      const childNode = {
        id: 2,
        label: obj.components[0]?.matnr ?? "",
      };

      parentNode.children.push(childNode);
      treeData.push(parentNode);

      return treeData;
    }
  }

  function handleConfirmUnion(e) {
    e.stopPropagation();
    const payload = {
      order: orderSelected.aufnr,
      condenser_unit_serial: barcodeCondenser,
      condenser_material_code: orderSelected.matnr.slice(-9),
      condenser_status_test: globalStatus === 1 ? true : false,
      compressor_unit_serial: barcodeProduct,
      compressor_material_code: orderSelected.components[0]?.matnr,
    };

    console.log(payload);
    dispatch(joinComponents(payload));
    console.log(componentsJoined);
    setInfoModalOpen(false);
  }

  function handleOpenModalUnion(e) {
    setComponentsJoined(false);
    e.stopPropagation();
    if (barcodeCondenser === "Escanea condensador") {
      setCurrentStepIndexUnion(0);
    }
    setInfoModalOpen(true);
  }

  const handleTestView = (param) => () => {
    console.log(`Link clicked with parameter: ${param}`);
    setTestView(param);
  };

  const [expandedNodes, setExpandedNodes] = useState([]);

  const toggleNode = (nodeId) => {
    if (expandedNodes.includes(nodeId)) {
      setExpandedNodes(expandedNodes.filter((id) => id !== nodeId));
    } else {
      setExpandedNodes([...expandedNodes, nodeId]);
    }
  };

  const renderNode = (node) => {
    const isNodeExpanded = expandedNodes.includes(node.id);
    const hasChildNodes = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="tree-node">
        <div
          className={`tree-node__label ${
            hasChildNodes ? "tree-node__label--clickable" : ""
          }`}
          onClick={() => hasChildNodes && toggleNode(node.id)}
        >
          {hasChildNodes && (
            <span
              className={`tree-node__icon ${
                isNodeExpanded
                  ? "tree-node__icon--expanded"
                  : "tree-node__icon--collapsed"
              }`}
            ></span>
          )}
          {node.label}
        </div>
        {isNodeExpanded && hasChildNodes && (
          <div className="tree-node__children">
            {node.children.map((childNode) => renderNode(childNode))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="mt-6 px-4 sm:px-6 lg:px-8 py-2 w-full max-w-10xl mx-auto">
        <header>
          <div className="sm:px-4 lg:px-4">
            <div className="flex items-center justify-between h-16 -mb-px">
              <h3 className="text-black text-2xl capitalize font-semibold text-gray-400 tracking-tight">
                Genealogía
              </h3>
              {/* Header: Right side */}
              <div className="flex items-center space-x-3">
                {Object.keys(orderSelected).length === 0 ? null : (
                  <button
                    onClick={(e) => {
                      handleNew();
                      e.currentTarget.blur();
                    }}
                    className="border border-slate-300 rounded w-32 h-12 text-base flex justify-center font-semibold"
                  >
                    <Add
                      className="mr-2 my-auto bg-transparent"
                      color="black"
                      size={20}
                    />
                    <span className="my-auto text-black font-semibold">
                      Nuevo
                    </span>
                  </button>
                )}

                {Object.keys(orderSelected).length === 0 ? null : (
                  <button
                    onClick={(e) => {
                      handleOpenModalUnion(e);
                      e.currentTarget.blur();
                    }}
                    className="border border-slate-300 rounded w-64 h-12 text-base flex justify-center font-semibold mr-2"
                  >
                    <Scan
                      className="mr-2 my-auto bg-transparent"
                      color="black"
                      size={20}
                    />
                    <span className="my-auto text-black font-semibold">
                      Unión de componentes
                    </span>
                  </button>
                )}

                <ReactToPrint
                  trigger={() => (
                    <button
                      onClick={(e) => {
                        e.currentTarget.blur();
                      }}
                      className={
                        globalStatus === 1 && componentsJoined
                          ? "w-64 h-12 bg-primary rounded text-white text-base flex justify-center hover:bg-green-500"
                          : "w-64 h-12 bg-secondary rounded text-black text-base flex justify-center hover:text-white disabled:pointer-events-none"
                      }
                      disabled={globalStatus != 1 && !componentsJoined}
                    >
                      <Barcode
                        className="mr-2 my-auto bg-transparent"
                        color="#ffff"
                        size={20}
                      />
                      <span className="bg-transparent my-auto text-white font-semibold hover:bg-green-500">
                        Imprimir etiqueta
                      </span>
                    </button>
                  )}
                  content={() => labelRef.current}
                />

                <div style={{ display: "none" }}>
                  <LabelPrinting
                    ref={labelRef}
                    qrValue={
                      barcodeCondenser != "Escanea condensador"
                        ? barcodeCondenser
                        : "ERR"
                    }
                    metadata={metadata}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-full mx-4 py-0 sm:mx-auto sm:px-6 lg:px-4">
          <div className="sm:flex sm:space-x-4">
            <section className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full sm:w-1/4 sm:my-4">
              <div className="bg-white p-5">
                <div className="sm:flex sm:items-start bg-white">
                  <div className="bg-white text-center sm:mt-0 sm:ml-2 sm:text-left">
                    <div className="flex items-center">
                      <Notepad2 className="mr-2" color="#A0A2A6" size={20} />
                      <h3 className="bg-white text-md font-medium text-gray">
                        Órden
                      </h3>
                    </div>

                    <p className="bg-white text-3xl font-bold text-black">
                      {Object.keys(orderSelected).length === 0
                        ? "Selecciona órden"
                        : orderSelected.aufnr}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full sm:w-1/3 sm:my-4">
              <div className="bg-white p-5">
                <div className="sm:flex sm:items-start bg-white">
                  <div className="bg-white text-center sm:mt-0 sm:ml-2 sm:text-left">
                    <div className="flex items-center">
                      <Category className="mr-2" color="#A0A2A6" size={20} />
                      <h3 className="bg-white text-md font-medium text-gray">
                        Compresor
                      </h3>
                    </div>

                    <p className="bg-white text-3xl font-bold text-black">
                      {Object.keys(orderSelected).length === 0
                        ? "--------"
                        : barcodeProduct}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full sm:w-1/3 sm:my-4">
              <div className="bg-white p-5">
                <div className="sm:flex sm:items-start bg-white">
                  <div className="bg-white text-center sm:mt-0 sm:ml-2 sm:text-left">
                    <div className="flex items-center">
                      <Category className="mr-2" color="#A0A2A6" size={20} />
                      <h3 className="bg-white text-md font-medium text-gray">
                        Condensador
                      </h3>
                    </div>

                    <p className="bg-white text-3xl font-bold text-black">
                      {Object.keys(orderSelected).length === 0
                        ? "--------"
                        : barcodeProduct != "Escanea compresor"
                        ? barcodeCondenser
                        : barcodeProduct}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full sm:w-1/4 sm:my-4">
              <div className="bg-white p-5">
                <div className="sm:flex sm:items-start bg-white">
                  <div className="bg-white text-center sm:mt-0 sm:ml-2 sm:text-left">
                    <div className="flex items-center">
                      <Box1
                        variant="Outline"
                        className="mr-2"
                        color="#A0A2A6"
                        size={20}
                      />
                      <h3 className="bg-white text-md font-medium text-gray">
                        Producto
                      </h3>
                    </div>

                    <p className="bg-white text-3xl font-bold text-black">
                      {Object.keys(orderSelected).length === 0
                        ? "--------"
                        : orderSelected.matnr.slice(-9)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* <section className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full sm:w-1/6 sm:my-4">
              <div className="bg-white p-5">
                <div className="sm:flex sm:items-start bg-white">
                  <div className="bg-white text-center sm:mt-0 sm:ml-2 sm:text-left">
                    <div className="flex items-center">
                      <Cd className="mr-2" color="#A0A2A6" size={20} />
                      <h3 className="bg-white text-md font-medium text-gray">
                        Planeado / Apuntado
                      </h3>
                    </div>
                    <p className="bg-white text-3xl font-bold text-black">
                      {Object.keys(orderSelected).length === 0
                        ? "--------"
                        : `${orderSelected.qtdpl} / ${orderSelected.qtdpr}`}
                    </p>
                  </div>
                </div>
              </div>
            </section> */}

            <section className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full sm:w-1/6 sm:my-4">
              <div className="bg-white p-5">
                <div className="sm:flex sm:items-start bg-white">
                  <div className="bg-white text-center sm:mt-0 sm:ml-2 sm:text-left">
                    <div className="flex items-center">
                      <CopySuccess className="mr-2" color="#A0A2A6" size={20} />
                      <h3 className="bg-white text-md font-medium text-gray">
                        Realizado
                      </h3>
                    </div>
                    <p className="bg-white text-3xl font-bold text-black">
                      {Object.keys(orderSelected).length === 0
                        ? "--------"
                        : `${componentsCount}`}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="max-w-full mx-4 py-0 sm:mx-auto sm:px-6 lg:px-4">
          <div className="sm:flex sm:space-x-4">
            <section
              style={{ height: "245px", overflowY: "scroll" }}
              className="inline-block align-bottom rounded-lg border border-slate-200 text-left mb-4 w-full sm:w-1/3 sm:my-4"
            >
              <div className="bg-white p-5">
                <h3 className="bg-white text-md font-medium text-gray">
                  Log de eventos
                </h3>
                <div
                  className="bg-white text-sm text-black"
                  style={{ maxHeight: "450px", overflowY: "auto" }}
                >
                  {genealogyLog
                    .slice()
                    .reverse()
                    .map((event, index, array) => (
                      <p
                        key={index}
                        style={{ fontWeight: index === 0 ? "bold" : "normal" }}
                      >
                        <span style={{ color: "green" }}>
                          {formatTimestampToDDMMYYYYHHMMSS(event.timestamp)}
                        </span>{" "}
                        - {event.text}{" "}
                      </p>
                    ))}
                </div>
              </div>
            </section>

            <section className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full sm:w-1/3 sm:my-4">
              <div className="bg-white p-5">
                <h3 className="bg-white text-md font-medium text-gray">
                  Semáforo
                </h3>
                <h3 className="bg-white text-2xl font-semibold text-black">
                  {testResultsList && testResultsList.length > 0 ? (
                    <div>
                      Estado global:{" "}
                      <span
                        className={
                          globalStatus === 1 ? "text-primary" : "text-red-500"
                        }
                      >
                        {globalStatus === 1 ? "OK" : "Error"}
                      </span>
                      {/* Muestra los detalles de los resultados de prueba aquí si es necesario */}
                    </div>
                  ) : (
                    <p className="text-black">
                      Resultados de pruebas no disponibles.
                    </p>
                  )}
                </h3>
                <div
                  className="flex grid justify-start"
                  style={{ marginLeft: "-10px", marginTop: "10px" }}
                >
                  {testResultsList && testResultsList.length > 0 ? (
                    <div>
                      <Stepper
                        className="!ml-0"
                        steps={testResultsList}
                        currentStepIndex={testResultsList.length}
                        styles={stylesOverride}
                      />

                      {/* Muestra los detalles de los resultados de prueba aquí si es necesario */}
                    </div>
                  ) : (
                    <p className="text-black ml-3"></p>
                  )}
                  <div></div>
                </div>
              </div>
            </section>

            <section className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full sm:w-1/3 sm:my-4">
              <div className="bg-white p-5">
                <h3 className="bg-white text-md font-medium text-gray">
                  Lista de materiales
                </h3>
                <div className="tree-view">
                  {Object.keys(orderSelected).length === 0 ? (
                    <p className="bg-white text-3xl font-bold text-black">
                      {" "}
                      --------{" "}
                    </p>
                  ) : (
                    buildTreeData(orderSelected).map((node) => renderNode(node))
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="max-w-full mx-4 py-0 sm:mx-auto sm:px-6 lg:px-4">
          <div className="sm:flex sm:space-x-4">
            <section
              style={{ height: "385px", overflowY: "scroll" }}
              className="inline-block align-bottom rounded-lg border border-slate-200 text-left mb-4 w-full sm:w-2/3 sm:my-4"
            >
              <div className="bg-white p-5">
                <h3 className="bg-white text-md font-medium text-gray">
                  Historial
                </h3>
                <div
                  className="bg-white text-sm text-black"
                  style={{ maxHeight: "500px", overflowY: "auto" }}
                >
                  <ComponentsTable />
                  {/* {genealogyLog
                    .slice()
                    .reverse()
                    .map((event, index, array) => (
                      <p
                        key={index}
                        style={{ fontWeight: index === 0 ? "bold" : "normal" }}
                      >
                        <span style={{ color: "green" }}>
                          {formatTimestampToDDMMYYYYHHMMSS(event.timestamp)}
                        </span>{" "}
                        - {event.text}{" "}
                      </p>
                    ))} */}
                </div>
              </div>
            </section>

            <section className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full sm:w-1/2 sm:my-4">
              <div className="bg-white p-5">
                <h3 className="bg-white text-md font-medium text-gray">
                  Progreso de la órden
                </h3>
                <p className="bg-white text-3xl font-bold text-black">
                  {Object.keys(orderSelected).length === 0 ? (
                    "--------"
                  ) : (
                    <BarChart04
                      order={orderSelected}
                      completed={componentsCount}
                      width={595}
                      height={248}
                    />
                  )}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      {/* Integration */}
      <div className="m-1.5">
        <ModalAction
          id="integration-modal"
          modalOpen={infoModalOpen}
          setModalOpen={setInfoModalOpen}
        >
          {/* Modal header */}
          <div className="mb-5 text-center">
            {/* Icons */}
            <div className="inline-flex items-center justify-center space-x-3 mb-4">
              {/* Mosaic logo */}
              {componentsJoined ? (
                <div>
                  <svg
                    width="120"
                    height="48"
                    viewBox="0 0 466 300"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M150 297C68.8141 297 3 231.186 3 150C3 68.8141 68.8141 3 150 3C231.186 3 297 68.8141 297 150C297 231.186 231.186 297 150 297Z"
                      fill="#15B053"
                      fill-opacity="0.53"
                      stroke="#15B053"
                      stroke-width="6"
                    />
                    <path
                      d="M129.94 189.991H93.8237V164.941H102.789V181.026H129.94V189.991Z"
                      fill="#616C99"
                    />
                    <path
                      d="M93.8237 90.9859H102.789V113.491H93.8237V90.9859Z"
                      fill="#F2C011"
                    />
                    <path
                      d="M152.319 73H171.444V97.7549H152.319V73Z"
                      fill="#F2C011"
                    />
                    <path
                      d="M161.882 73H171.444V97.7549H161.882V73Z"
                      fill="#F28E3A"
                    />
                    <path
                      d="M107.869 168.625H88.7437V144.98L92.4581 140.498L88.7437 136.015V111.25H107.869V168.625Z"
                      fill="#50527C"
                    />
                    <path
                      d="M88.7437 136.015H129.94V144.98H88.7437V136.015Z"
                      fill="#616C99"
                    />
                    <path
                      d="M200.132 130.375L194.78 149.5L200.132 168.625V209.266L191.131 206.875H190.569L181.007 216.438H142.757L133.194 206.875H132.639L123.632 209.266V101.688L133.194 92.125H190.569L200.132 101.688V130.375Z"
                      fill="#50527C"
                    />
                    <path
                      d="M200.132 130.375L194.78 149.5L200.132 168.625V209.266L191.131 206.875H190.569L181.007 216.438H161.882V92.125H190.569L200.132 101.688V130.375Z"
                      fill="#3A3B5C"
                    />
                    <path
                      d="M200.132 145.018L194.78 149.5L200.132 153.982V168.625H142.757V130.375H200.132V145.018Z"
                      fill="#F3FFFF"
                    />
                    <path
                      d="M200.132 145.018L194.78 149.5L200.132 153.982V168.625H161.882V130.375H200.132V145.018Z"
                      fill="#D7F2F1"
                    />
                    <path
                      d="M113.512 206.875H132.637V226H113.512V206.875Z"
                      fill="#616C99"
                    />
                    <path
                      d="M191.131 206.875H210.256V226H191.131V206.875Z"
                      fill="#50527C"
                    />
                    <path
                      d="M156.82 145.018H200.132V153.982H156.82V145.018Z"
                      fill="#ACDDD7"
                    />
                    <path
                      d="M161.882 145.018H200.132V153.982H161.882V145.018Z"
                      fill="#83C6BD"
                    />
                    <rect
                      x="169"
                      y="3"
                      width="294"
                      height="294"
                      rx="147"
                      fill="#688ED5"
                      fill-opacity="0.53"
                      stroke="#688ED5"
                      stroke-width="6"
                    />
                    <g clip-path="url(#clip0_0_1)">
                      <path
                        d="M360.96 210.894H252.829C249.686 210.894 247.138 208.346 247.138 205.203V85.6911C247.138 82.5479 249.686 80 252.829 80H360.96C364.103 80 366.651 82.5479 366.651 85.6911V205.203C366.651 208.346 364.102 210.894 360.96 210.894Z"
                        fill="#E6F7FE"
                      />
                      <path
                        d="M360.96 80H354.13C357.273 80 359.821 82.5479 359.821 85.6911V205.203C359.821 208.346 357.273 210.894 354.13 210.894H360.96C364.103 210.894 366.651 208.346 366.651 205.203V85.6911C366.651 82.5479 364.102 80 360.96 80Z"
                        fill="#D3EFFD"
                      />
                      <path
                        d="M357.544 91.952V171.057H256.243V91.952C256.243 90.3797 257.517 89.1055 259.09 89.1055H339.333L343.885 92.5207L348.438 89.1055H354.7C356.272 89.1055 357.544 90.3797 357.544 91.952Z"
                        fill="#688ED5"
                      />
                      <path
                        d="M358.114 220H255.675C254.103 220 252.829 218.726 252.829 217.155V210.895H360.959V217.155C360.959 218.726 359.685 220 358.114 220Z"
                        fill="#9FACBA"
                      />
                      <path
                        d="M352.423 210.894V217.154C352.423 218.726 351.149 220 349.577 220H358.114C359.686 220 360.96 218.726 360.96 217.154V210.894H352.423Z"
                        fill="#8D9CA8"
                      />
                      <path
                        d="M339.333 89.1057V96.5041C339.333 97.447 338.569 98.2115 337.626 98.2115H279.008C271.465 98.2115 265.35 104.327 265.35 111.87C265.35 119.413 271.465 125.528 279.008 125.528H334.781C337.295 125.528 339.333 127.567 339.333 130.081C339.333 132.596 337.295 134.634 334.781 134.634H279.008C271.465 134.634 265.35 140.749 265.35 148.292C265.35 155.836 271.465 161.951 279.008 161.951H337.626C338.569 161.951 339.333 162.715 339.333 163.658V171.057H348.439V163.089C348.439 157.432 343.853 152.846 338.195 152.846H279.008C276.494 152.846 274.455 150.807 274.455 148.293C274.455 145.778 276.494 143.74 279.008 143.74H334.781C342.324 143.74 348.439 137.625 348.439 130.082C348.439 122.538 342.324 116.423 334.781 116.423H279.008C276.494 116.423 274.455 114.385 274.455 111.871C274.455 109.356 276.494 107.318 279.008 107.318H338.195C343.852 107.318 348.439 102.731 348.439 97.074V89.1057H339.333Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M339.333 164.228H348.439V171.057H339.333V164.228Z"
                        fill="#FFD064"
                      />
                      <path
                        d="M339.333 89.1057H348.439V95.9351H339.333V89.1057Z"
                        fill="#FFD064"
                      />
                      <path
                        d="M355.474 179.818V183.92H357.544V188.924H355.474V193.025H357.544V198.943C357.544 200.515 356.272 201.789 354.7 201.789H259.09C257.517 201.789 256.243 200.515 256.243 198.943V193.025H258.425V188.924H256.243V183.92H258.425V179.818H256.243V171.057H357.544V179.818H355.474Z"
                        fill="#596C76"
                      />
                      <path
                        d="M366.651 188.13H375.756V201.788H366.651V188.13Z"
                        fill="#75CFF9"
                      />
                      <path
                        d="M380.309 201.789H375.756V172.195C375.756 169.681 377.795 167.642 380.309 167.642C382.824 167.642 384.862 169.681 384.862 172.195V197.236C384.862 199.75 382.824 201.789 380.309 201.789Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M321.193 183.921H310.807C309.674 183.921 308.756 183.003 308.756 181.87C308.756 180.737 309.674 179.819 310.807 179.819H321.193C322.326 179.819 323.244 180.737 323.244 181.87C323.244 183.003 322.326 183.921 321.193 183.921Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M321.193 193.026H310.807C309.674 193.026 308.756 192.109 308.756 190.976C308.756 189.843 309.674 188.925 310.807 188.925H321.193C322.326 188.925 323.244 189.843 323.244 190.976C323.244 192.109 322.326 193.026 321.193 193.026Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M326.842 179.819H357.544V183.921H326.842V179.819Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M326.842 188.925H357.544V193.026H326.842V188.925Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M303.507 183.921H292.071C290.938 183.921 290.02 183.003 290.02 181.87C290.02 180.737 290.938 179.819 292.071 179.819H303.507C304.639 179.819 305.558 180.737 305.558 181.87C305.558 183.003 304.639 183.921 303.507 183.921Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M303.507 193.026H292.071C290.938 193.026 290.02 192.109 290.02 190.976C290.02 189.843 290.938 188.925 292.071 188.925H303.507C304.639 188.925 305.558 189.843 305.558 190.976C305.558 192.109 304.639 193.026 303.507 193.026Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M256.244 179.819H286.947V183.921H256.244V179.819Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M256.244 188.925H286.947V193.026H256.244V188.925Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M302.342 191.814V181.032C302.342 179.476 303.603 178.215 305.159 178.215H308.63C310.186 178.215 311.447 179.476 311.447 181.032V191.814C311.447 193.37 310.186 194.631 308.63 194.631H305.159C303.603 194.631 302.342 193.37 302.342 191.814Z"
                        fill="#E6F7FE"
                      />
                      <path
                        d="M320.553 191.814V181.032C320.553 179.476 321.814 178.215 323.37 178.215H326.842C328.397 178.215 329.658 179.476 329.658 181.032V191.814C329.658 193.37 328.397 194.631 326.842 194.631H323.37C321.814 194.631 320.553 193.37 320.553 191.814Z"
                        fill="#E6F7FE"
                      />
                      <path
                        d="M293.236 191.814V181.032C293.236 179.476 291.975 178.215 290.419 178.215H286.947C285.391 178.215 284.13 179.476 284.13 181.032V191.814C284.13 193.37 285.391 194.631 286.947 194.631H290.419C291.975 194.631 293.236 193.37 293.236 191.814Z"
                        fill="#E6F7FE"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_0_1">
                        <rect
                          width="140"
                          height="140"
                          fill="white"
                          transform="translate(246 80)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              ) : (
                <div className="inline-flex items-center justify-center space-x-3 ">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 300 300"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 150C3 68.8141 68.8141 3 150 3C231.186 3 297 68.8141 297 150C297 231.186 231.186 297 150 297C68.8141 297 3 231.186 3 150Z"
                      fill="#15B053"
                      fill-opacity="0.53"
                      stroke="#15B053"
                      stroke-width="6"
                    />
                    <path
                      d="M129.94 189.991H93.8239V164.941H102.789V181.026H129.94V189.991Z"
                      fill="#616C99"
                    />
                    <path
                      d="M93.8239 90.9859H102.789V113.491H93.8239V90.9859Z"
                      fill="#F2C011"
                    />
                    <path
                      d="M152.319 73H171.444V97.7549H152.319V73Z"
                      fill="#F2C011"
                    />
                    <path
                      d="M161.882 73H171.444V97.7549H161.882V73Z"
                      fill="#F28E3A"
                    />
                    <path
                      d="M107.869 168.625H88.7438V144.98L92.4582 140.498L88.7438 136.015V111.25H107.869V168.625Z"
                      fill="#50527C"
                    />
                    <path
                      d="M88.7438 136.015H129.94V144.98H88.7438V136.015Z"
                      fill="#616C99"
                    />
                    <path
                      d="M200.132 130.375L194.78 149.5L200.132 168.625V209.266L191.131 206.875H190.569L181.007 216.438H142.757L133.194 206.875H132.639L123.632 209.266V101.688L133.194 92.125H190.569L200.132 101.688V130.375Z"
                      fill="#50527C"
                    />
                    <path
                      d="M200.132 130.375L194.78 149.5L200.132 168.625V209.266L191.131 206.875H190.569L181.007 216.438H161.882V92.125H190.569L200.132 101.688V130.375Z"
                      fill="#3A3B5C"
                    />
                    <path
                      d="M200.132 145.018L194.78 149.5L200.132 153.982V168.625H142.757V130.375H200.132V145.018Z"
                      fill="#F3FFFF"
                    />
                    <path
                      d="M200.132 145.018L194.78 149.5L200.132 153.982V168.625H161.882V130.375H200.132V145.018Z"
                      fill="#D7F2F1"
                    />
                    <path
                      d="M113.512 206.875H132.637V226H113.512V206.875Z"
                      fill="#616C99"
                    />
                    <path
                      d="M191.131 206.875H210.256V226H191.131V206.875Z"
                      fill="#50527C"
                    />
                    <path
                      d="M156.82 145.018H200.132V153.982H156.82V145.018Z"
                      fill="#ACDDD7"
                    />
                    <path
                      d="M161.882 145.018H200.132V153.982H161.882V145.018Z"
                      fill="#83C6BD"
                    />
                  </svg>

                  {/* Arrows */}
                  <svg
                    className="h-4 w-4 fill-current text-slate-400"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5 3V0L0 4l5 4V5h8a1 1 0 000-2H5zM11 11H3a1 1 0 000 2h8v3l5-4-5-4v3z" />
                  </svg>
                  {/* Cruip logo */}
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 300 300"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="294"
                      height="294"
                      rx="147"
                      fill="#688ED5"
                      fill-opacity="0.53"
                      stroke="#688ED5"
                      stroke-width="6"
                    />
                    <g clip-path="url(#clip0_207_3)">
                      <path
                        d="M194.959 210.894H86.8294C83.6862 210.894 81.1383 208.346 81.1383 205.203V85.6911C81.1383 82.5479 83.6862 80 86.8294 80H194.959C198.103 80 200.65 82.5479 200.65 85.6911V205.203C200.65 208.346 198.102 210.894 194.959 210.894Z"
                        fill="#E6F7FE"
                      />
                      <path
                        d="M194.959 80H188.13C191.273 80 193.821 82.5479 193.821 85.6911V205.203C193.821 208.346 191.273 210.894 188.13 210.894H194.959C198.103 210.894 200.65 208.346 200.65 205.203V85.6911C200.65 82.5479 198.102 80 194.959 80Z"
                        fill="#D3EFFD"
                      />
                      <path
                        d="M191.543 91.952V171.057H90.2429V91.952C90.2429 90.3797 91.5171 89.1055 93.0894 89.1055H173.332L177.885 92.5207L182.438 89.1055H188.7C190.272 89.1055 191.543 90.3797 191.543 91.952Z"
                        fill="#688ED5"
                      />
                      <path
                        d="M192.114 220H89.6748C88.1033 220 86.8291 218.726 86.8291 217.155V210.895H194.959V217.155C194.959 218.726 193.685 220 192.114 220Z"
                        fill="#9FACBA"
                      />
                      <path
                        d="M186.423 210.894V217.154C186.423 218.726 185.149 220 183.577 220H192.114C193.685 220 194.959 218.726 194.959 217.154V210.894H186.423Z"
                        fill="#8D9CA8"
                      />
                      <path
                        d="M173.333 89.1057V96.5041C173.333 97.447 172.569 98.2115 171.626 98.2115H113.008C105.465 98.2115 99.3495 104.327 99.3495 111.87C99.3495 119.413 105.465 125.528 113.008 125.528H168.78C171.295 125.528 173.333 127.567 173.333 130.081C173.333 132.596 171.295 134.634 168.78 134.634H113.008C105.465 134.634 99.3495 140.749 99.3495 148.292C99.3495 155.836 105.465 161.951 113.008 161.951H171.626C172.569 161.951 173.333 162.715 173.333 163.658V171.057H182.439V163.089C182.439 157.432 177.853 152.846 172.195 152.846H113.008C110.493 152.846 108.455 150.807 108.455 148.293C108.455 145.778 110.494 143.74 113.008 143.74H168.78C176.324 143.74 182.439 137.625 182.439 130.082C182.439 122.538 176.324 116.423 168.78 116.423H113.008C110.493 116.423 108.455 114.385 108.455 111.871C108.455 109.356 110.494 107.318 113.008 107.318H172.195C177.852 107.318 182.439 102.731 182.439 97.074V89.1057H173.333Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M173.333 164.228H182.439V171.057H173.333V164.228Z"
                        fill="#FFD064"
                      />
                      <path
                        d="M173.333 89.1057H182.439V95.9351H173.333V89.1057Z"
                        fill="#FFD064"
                      />
                      <path
                        d="M189.473 179.818V183.92H191.543V188.924H189.473V193.025H191.543V198.943C191.543 200.515 190.272 201.789 188.7 201.789H93.0894C91.5171 201.789 90.2429 200.515 90.2429 198.943V193.025H92.425V188.924H90.2429V183.92H92.425V179.818H90.2429V171.057H191.543V179.818H189.473Z"
                        fill="#596C76"
                      />
                      <path
                        d="M200.65 188.13H209.756V201.788H200.65V188.13Z"
                        fill="#75CFF9"
                      />
                      <path
                        d="M214.309 201.789H209.756V172.195C209.756 169.681 211.795 167.642 214.309 167.642C216.823 167.642 218.862 169.681 218.862 172.195V197.236C218.862 199.75 216.823 201.789 214.309 201.789Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M155.193 183.921H144.807C143.674 183.921 142.756 183.003 142.756 181.87C142.756 180.737 143.674 179.819 144.807 179.819H155.193C156.326 179.819 157.244 180.737 157.244 181.87C157.244 183.003 156.326 183.921 155.193 183.921Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M155.193 193.026H144.807C143.674 193.026 142.756 192.109 142.756 190.976C142.756 189.843 143.674 188.925 144.807 188.925H155.193C156.326 188.925 157.244 189.843 157.244 190.976C157.244 192.109 156.326 193.026 155.193 193.026Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M160.842 179.819H191.544V183.921H160.842V179.819Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M160.842 188.925H191.544V193.026H160.842V188.925Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M137.507 183.921H126.071C124.938 183.921 124.02 183.003 124.02 181.87C124.02 180.737 124.938 179.819 126.071 179.819H137.507C138.639 179.819 139.557 180.737 139.557 181.87C139.557 183.003 138.639 183.921 137.507 183.921Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M137.507 193.026H126.071C124.938 193.026 124.02 192.109 124.02 190.976C124.02 189.843 124.938 188.925 126.071 188.925H137.507C138.639 188.925 139.557 189.843 139.557 190.976C139.557 192.109 138.639 193.026 137.507 193.026Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M90.2438 179.819H120.947V183.921H90.2438V179.819Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M90.2438 188.925H120.947V193.026H90.2438V188.925Z"
                        fill="#FFE07D"
                      />
                      <path
                        d="M136.342 191.814V181.032C136.342 179.476 137.603 178.215 139.159 178.215H142.63C144.186 178.215 145.447 179.476 145.447 181.032V191.814C145.447 193.37 144.186 194.631 142.63 194.631H139.159C137.603 194.631 136.342 193.37 136.342 191.814Z"
                        fill="#E6F7FE"
                      />
                      <path
                        d="M154.553 191.814V181.032C154.553 179.476 155.814 178.215 157.37 178.215H160.842C162.397 178.215 163.658 179.476 163.658 181.032V191.814C163.658 193.37 162.397 194.631 160.842 194.631H157.37C155.814 194.631 154.553 193.37 154.553 191.814Z"
                        fill="#E6F7FE"
                      />
                      <path
                        d="M127.236 191.814V181.032C127.236 179.476 125.975 178.215 124.419 178.215H120.947C119.391 178.215 118.13 179.476 118.13 181.032V191.814C118.13 193.37 119.391 194.631 120.947 194.631H124.419C125.975 194.631 127.236 193.37 127.236 191.814Z"
                        fill="#E6F7FE"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_207_3">
                        <rect
                          width="140"
                          height="140"
                          fill="white"
                          transform="translate(80 80)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              )}
            </div>
            <div className="text-lg font-semibold text-slate-800">
              Unión de componentes
            </div>
          </div>
          {/* Modal content */}
          <div className="text-sm mb-5">
            <div className="font-medium text-slate-800 mb-6">
              {componentsJoined ? (
                <div>
                  <p>
                    Componentes unidos exitosamente. <br></br>Puedes cerrar esta
                    ventana e imprimir etiqueta.
                  </p>
                </div>
              ) : (
                <div>
                  Parece que estás intentando procesar un nuevo item. <br></br>
                  Para continuar escanea los siguientes componentes:
                </div>
              )}
            </div>

            <div className="" style={{ marginLeft: "-150px" }}>
              <div>
                <Stepper
                  className="!ml-0"
                  steps={stepsUnion}
                  currentStepIndex={currentStepIndexUnion}
                  onStepClick={handleStepClickUnion}
                  styles={stylesOverrideUnion}
                />

                {/* Muestra los detalles de los resultados de prueba aquí si es necesario */}
              </div>

              <div></div>
            </div>
            {componentsJoined ? null : (
              <div className="mt-8 text-md text-slate-500">
                {barcodeProduct === barcodeCondenser ? (
                  <p>
                    Operación no permitida: Estas intentando unir 2 componentes
                    con el mismo serial.
                  </p>
                ) : globalStatus === 1 ? (
                  <p>
                    Al dar click en "Confirmar unión" podrás realizar la
                    impresión de la etiqueta del componente final.
                  </p>
                ) : null}
                {testResultsList.length === 0 ? (
                  <p>
                    No se encontró el producto: {barcodeCondenser} en la base de
                    datos del tester.
                  </p>
                ) : null}
                {testResultsList.length > 0 ? (
                  globalStatus === 0 ? (
                    <p>
                      No puedes unir ambos componentes ya que el condensador
                      presenta error en sus pruebas. Cierra esta ventana y
                      verifica el semáforo.
                    </p>
                  ) : null
                ) : null}
              </div>
            )}
          </div>
          {/* Modal footer */}
          <div className="flex flex-wrap justify-end space-x-2">
            <button
              className="btn-sm border-slate-200 hover:border-slate-300 text-slate-600"
              onClick={(e) => {
                e.stopPropagation();
                setInfoModalOpen(false);
              }}
            >
              {componentsJoined ? <p>Cerrar</p> : <p>Cancelar</p>}
            </button>
            {componentsJoined ? null : (
              <button
                className={
                  globalStatus === 1 && barcodeCondenser != barcodeProduct
                    ? "btn-sm bg-primary hover:bg-primary text-white "
                    : "btn-sm bg-secondary text-white text-base flex justify-center hover:text-white disabled:pointer-events-none"
                }
                onClick={handleConfirmUnion}
                disabled={
                  globalStatus !== 1 || barcodeCondenser === barcodeProduct
                }
              >
                Confirmar unión
              </button>
            )}
          </div>
        </ModalAction>
        {/* End */}
      </div>
    </>
  );
}

export default GenealogyDashboard;
