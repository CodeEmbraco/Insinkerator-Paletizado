import { makeStyles } from "@material-ui/core/styles";
import {
  Add,
  Box1,
  Category,
  Grid8,
  HashtagSquare,
  Health,
  Notepad2,
} from "iconsax-react";
import { useState, useEffect, useRef } from "react";
import BrowserPrintComponent from "../printerComponent";

import Stepper from "@keyvaluesystems/react-vertical-stepper";
import { Barcode } from "iconsax-react";

import useScanDetection from "use-scan-detection";
import { useDispatch, useSelector } from "react-redux";
import ReactToPrint from "react-to-print";
import LabelPrinting from "../partials/genealogy/LabelPrinting";

import {
  metadataOrderSelected,
  palletAmount,
  selectOrderSelected,
  setPalletAmount,
  setOrderSelected,
  setMetadataOrderSelected,
} from "../store/slice/orderSelectedSlice";

import ComponentsTable from "../partials/paletization/ComponentsTable";
import {
  addEventToPaletizationLog,
  selectPaletizationLog,
} from "../store/slice/eventsLogSlice";
import {
  createPallet,
  changePalletOrder,
  mountComponent,
  processInSAP,
  selectComponents,
  selectLoadingProcessInSap,
  selectPallet,
  setComponents,
  setComponentsJoined,
  getLastPallet,
  setPallet,
  getAllComponents,
} from "../store/slice/palletsSlice";
import {
  getTestResults,
  selectGlobalStatus,
  selectTestResults,
  setGlobalStatus,
  setTestResults,
} from "../store/slice/testResultSlice";

import ModalBlank from "../components/ModalBlank";
import { requestOpenOrders } from "../components/Layout";
import PalletProductMismatchModal from "../components/PalletProductMismatchModal";
import PalletOrderMismatchModal from "../components/PalletOrderMismatchModal";
import {
  notifyError,
  notifyPalletScanned,
  notifyProductScanned,
} from "../partials/paletization/Toasts";
import {
  DEFAULT_PALLET_QUANTITY,
  getPalletQuantityForProduct,
} from "../utils/palletQuantities";
import { getOrderRemaining } from "../utils/orderQuantities";

// Contraseña requerida para modificar manualmente la cantidad de piezas por pallet.
const PALLET_AMOUNT_PASSWORD = "embraco123";
// Contraseña de administrador para reasignar un pallet a otra orden.
const CHANGE_ORDER_PASSWORD = "NidecNGA-TI26";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    "& button": {
      flexBasis: "20%",
      margin: "2%",
    },
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  formControl: {
    marginTop: "5%",
    marginBottom: "7%",
    minWidth: 120,
  },
}));

function PaletizationView() {
  const testResultsList = useSelector(selectTestResults);
  const globalStatus = useSelector(selectGlobalStatus);
  const orderSelected = useSelector(selectOrderSelected);
  const metadata = useSelector(metadataOrderSelected);
  const palletamount = useSelector(palletAmount);
  const paletizationLog = useSelector(selectPaletizationLog);

  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [isEditingPalletAmount, setIsEditingPalletAmount] = useState(false);
  const [editablePalletAmount, setEditablePalletAmount] = useState(
    DEFAULT_PALLET_QUANTITY
  );

  // Bloqueo por contraseña previo a editar la cantidad de pallet
  const [palletAmountPasswordOpen, setPalletAmountPasswordOpen] =
    useState(false);
  const [palletAmountPasswordInput, setPalletAmountPasswordInput] =
    useState("");
  const [palletAmountPasswordError, setPalletAmountPasswordError] =
    useState(false);

  const [barcodePallet, setBarcodePallet] = useState("Nuevo pallet");
  const [palletIntermedio, setPalletIntermedio] = useState(null);
  const [idAuto, setIdAuto] = useState(1);
  const [barcodeProduct, setBarcodeProduct] = useState("Escanea producto");
  const labelRef = useRef();
  const componentsSectionRef = useRef(null);

  const dispatch = useDispatch();

  const [selectedItems, setSelectedItems] = useState([]);
  const [hasProcessed, setHasProcessed] = useState(false);

  // Modal de producto incorrecto: se muestra cuando el producto escaneado no
  // corresponde al producto de la orden seleccionada (últimos 6 del matnr).
  const [palletProductMismatchOpen, setPalletProductMismatchOpen] =
    useState(false);
  const [palletProductMismatchInfo, setPalletProductMismatchInfo] = useState({
    expectedProduct: "",
    scannedProduct: "",
  });

  // El pallet escaneado ya existe ligado a otra orden
  const [palletOrderMismatchOpen, setPalletOrderMismatchOpen] = useState(false);
  const [palletOrderMismatchInfo, setPalletOrderMismatchInfo] = useState({
    pallet: "",
    palletOrder: "",
    selectedOrder: "",
  });
  // Contraseña de administrador para reasignar el pallet a la orden seleccionada
  const [changeOrderPasswordOpen, setChangeOrderPasswordOpen] = useState(false);
  const [changeOrderPasswordInput, setChangeOrderPasswordInput] = useState("");
  const [changeOrderPasswordError, setChangeOrderPasswordError] = useState(false);

  const palletSelected = useSelector(selectPallet);

  const componentsList = useSelector(selectComponents);

  const isLoading = useSelector(selectLoadingProcessInSap);

  // Espacio de la orden en SAP (planeado - apuntado) y piezas de este pallet
  // que todavía no se han notificado. La cantidad a notificar nunca debe
  // exceder el espacio de la orden.
  const orderRemaining = getOrderRemaining(orderSelected);
  const pendingToNotify = componentsList.filter(
    (component) => !component.send_to_sap
  ).length;
  const exceedsOrderSpace =
    orderRemaining !== null && pendingToNotify > orderRemaining;

  const handleSelectedItems = (selectedItems) => {
    setSelectedItems([...selectedItems]);
  };

  useScanDetection({
    // Mientras se edita la cantidad o se escribe la contraseña, no bloquear el teclado
    preventDefault:
      !isEditingPalletAmount && !palletAmountPasswordOpen && !changeOrderPasswordOpen,
    onComplete: async (code) => {
      console.log(code);
      if (palletAmountPasswordOpen || changeOrderPasswordOpen) return;

      const formattedCode = code.replace(/Shift/g, "");

      // Sin orden seleccionada no se escanea nada: cada pallet nuevo exige
      // elegir la orden primero (evita pallets ligados a la orden anterior).
      if (!orderSelected?.aufnr) {
        notifyError("Selecciona la orden antes de escanear.");
        dispatch(
          addEventToPaletizationLog({
            text:
              "Escaneo ignorado: no hay orden seleccionada. Código: " +
              formattedCode.toUpperCase(),
            timestamp: new Date().toISOString(),
          })
        );
        requestOpenOrders();
        return;
      }
      if (componentsList.length != 0 && componentsList.length == palletamount) {
        notifyError("Cantidad de pallet ya está completada");
        return;
      }

      if (formattedCode.length >= 11) {
        // Bloquear el escaneo de piezas si no hay un pallet activo
        // (seleccionado con "Nuevo pallet" o escaneado previamente).
        const hasActivePallet =
          barcodePallet !== "Nuevo pallet" || !!palletSelected?.identifier;
        if (!hasActivePallet) {
          notifyError(
            "Selecciona o escanea un pallet antes de escanear piezas"
          );
          dispatch(
            addEventToPaletizationLog({
              text:
                "Pieza RECHAZADA: no hay pallet activo. Escaneado: " +
                formattedCode.toUpperCase(),
              timestamp: new Date().toISOString(),
            })
          );
          return;
        }

        // La orden ya no admite más piezas: no se monta nada más en el pallet.
        if (orderRemaining !== null && pendingToNotify >= orderRemaining) {
          notifyError(
            "La orden " +
              orderSelected.aufnr +
              " solo admite " +
              orderRemaining +
              " piezas más en SAP y el pallet ya tiene " +
              pendingToNotify +
              " por notificar."
          );
          dispatch(
            addEventToPaletizationLog({
              text:
                "Pieza RECHAZADA: la orden " +
                orderSelected.aufnr +
                " no tiene espacio (pendientes en SAP: " +
                orderRemaining +
                ", por notificar en el pallet: " +
                pendingToNotify +
                "). Escaneado: " +
                formattedCode.toUpperCase(),
              timestamp: new Date().toISOString(),
            })
          );
          return;
        }

        // Validar que el producto escaneado corresponda a la orden.
        // El serial escaneado trae fecha/turno al inicio y datos extra después
        // del primer espacio (ej. "26070311483180758A 100530"). Los dígitos
        // iniciales del serial no coinciden con el matnr; lo que sí es estable
        // son los ÚLTIMOS 6 caracteres del tramo previo al primer espacio
        // (ej. "80758A"), que se comparan contra los ÚLTIMOS 6 del matnr. Si
        // no coinciden, se bloquea el montaje y se muestra el modal rojo.
        const PRODUCT_CODE_LENGTH = 6;
        const scannedProduct = formattedCode.toUpperCase();
        const expectedProductCode = (orderSelected?.matnr ?? "")
          .toUpperCase()
          .slice(-PRODUCT_CODE_LENGTH);
        const scannedProductCode = scannedProduct
          .trim()
          .split(/\s+/)[0]
          .slice(-PRODUCT_CODE_LENGTH);
        if (
          expectedProductCode &&
          scannedProductCode &&
          scannedProductCode !== expectedProductCode
        ) {
          setPalletProductMismatchInfo({
            expectedProduct: expectedProductCode,
            scannedProduct: scannedProductCode,
          });
          setPalletProductMismatchOpen(true);
          dispatch(
            addEventToPaletizationLog({
              text:
                "Producto RECHAZADO: no corresponde a la orden. Esperado: " +
                expectedProductCode +
                " | Escaneado: " +
                scannedProductCode +
                " (" +
                scannedProduct +
                ")",
              timestamp: new Date().toISOString(),
            })
          );
          return;
        }

        const codeScannedEvent = {
          text:
            "Producto escaneado: " + code.replace(/Shift/g, "").toUpperCase(),
          timestamp: new Date().toISOString(),
        };
        notifyProductScanned(code.replace(/Shift/g, "").toUpperCase());
        setBarcodeProduct(code.replace(/Shift/g, "").toUpperCase());

        dispatch(addEventToPaletizationLog(codeScannedEvent));
        //dispatch(getTestResults(code.replace(/Shift/g, "").toUpperCase()));
        console.log("HDR Toy escaneando...Enero12");
        console.log(barcodeProduct);
        /*const getTestResultsEvent = {
          text:
            "Consultando resultados de prueba de producto: " +
            code.replace(/Shift/g, "").toUpperCase(),
          timestamp: new Date().toISOString(),
        };*/

        // dispatch(addEventToPaletizationLog(getTestResultsEvent));
        const condenserMaterial = orderSelected.matnr.slice(-9);
        const compressorMaterial = orderSelected.matnr.slice(-9);
        console.log("Linea 144");
        const data = {
          palette: barcodePallet,
          condenser: code.replace(/Shift/g, "").toUpperCase(),
          compressor: "-", //response.compressor_unit_serial,
          compressorMaterial: condenserMaterial, //compressorMaterial,
          condenserMaterial: condenserMaterial,
        };

        console.log(data);
        dispatch(mountComponent(data));
      } else {
        // Si la cadena es más corta, considerarla un ID de pallet. Se limpia
        // el pallet anterior pero se conserva la orden seleccionada.
        resetPalletState();
        const palletCode = formattedCode.toUpperCase();
        if (
          metadata.length > 0 &&
          metadata.find((obj) => obj.ID_CARACTMATERIAL === 185)
            ?.DE_VALORCARACTMAT == componentsList.length
        ) {
          notifyError(
            "El total de montados no debe superar la cantidad por pallet",
          );
          return;
        }
        startPallet(palletCode);
      }
    },
  });

  // Inicia (o retoma) el pallet escaneado con la orden seleccionada. Lo usa el
  // escaneo y también la reasignación de orden, que vuelve a cargarlo.
  function startPallet(palletCode) {
    dispatch(
      addEventToPaletizationLog({
        text: "Pallet escaneado: " + palletCode,
        timestamp: new Date().toISOString(),
      })
    );
    setBarcodePallet(palletCode);
    setPalletIntermedio(palletCode);
    dispatch(
      createPallet(
        orderSelected.aufnr,
        palletCode,
        orderSelected.matnr.slice(-9),
        editablePalletAmount,
        idAuto,
        () => {
          // El API rechazó o no respondió: limpiar la tarjeta del pallet
          setBarcodePallet("Nuevo pallet");
          setPalletIntermedio(null);
        },
        (palletOrder) => {
          setPalletOrderMismatchInfo({
            pallet: palletCode,
            palletOrder,
            selectedOrder: orderSelected.aufnr,
          });
          setPalletOrderMismatchOpen(true);
        }
      )
    );
    notifyPalletScanned(palletCode);
    dispatch(
      addEventToPaletizationLog({
        text: "Consultando registro de Pallet: " + palletCode,
        timestamp: new Date().toISOString(),
      })
    );
  }

  // Reasignar el pallet a la orden seleccionada: candado con contraseña de
  // administrador y después se vuelve a cargar el pallet con la orden nueva.
  function handleRequestChangeOrder() {
    setPalletOrderMismatchOpen(false);
    setChangeOrderPasswordInput("");
    setChangeOrderPasswordError(false);
    setChangeOrderPasswordOpen(true);
  }

  async function handleConfirmChangeOrder() {
    if (changeOrderPasswordInput !== CHANGE_ORDER_PASSWORD) {
      setChangeOrderPasswordError(true);
      return;
    }
    setChangeOrderPasswordOpen(false);
    setChangeOrderPasswordInput("");
    const { pallet } = palletOrderMismatchInfo;
    const result = await dispatch(
      changePalletOrder(pallet, orderSelected.aufnr, orderSelected.matnr.slice(-9))
    );
    if (result) {
      notifyPalletScanned("Pallet " + pallet + " reasignado a la orden " + orderSelected.aufnr);
      startPallet(pallet);
    }
  }

  // Si cambian de orden con un pallet en curso, ese pallet queda ligado en BD
  // a la orden anterior: se descarta en pantalla y hay que escanearlo de nuevo
  // con la orden correcta. "Continuar pallet" sincroniza la orden con la del
  // pallet, por lo que no se descarta en ese caso.
  const prevAufnrRef = useRef(orderSelected?.aufnr);
  useEffect(() => {
    const prev = prevAufnrRef.current;
    const current = orderSelected?.aufnr;
    prevAufnrRef.current = current;
    if (
      prev &&
      current &&
      prev !== current &&
      palletSelected?.identifier &&
      palletSelected?.order &&
      String(palletSelected.order) !== String(current)
    ) {
      const palletId = palletSelected.identifier;
      resetPalletState();
      notifyError(
        "Cambiaste de orden: el pallet " +
          palletId +
          " se descartó. Escanea o crea el pallet de nuevo para la orden " +
          current +
          "."
      );
      dispatch(
        addEventToPaletizationLog({
          text:
            "Orden cambiada de " +
            prev +
            " a " +
            current +
            " con pallet en curso. Pallet " +
            palletId +
            " descartado en pantalla.",
          timestamp: new Date().toISOString(),
        })
      );
    }
  }, [orderSelected?.aufnr]);

  function handleCreatePallet(palletIdentifier) {
    dispatch(
      createPallet(
        orderSelected.aufnr,
        palletIdentifier,
        orderSelected.matnr.slice(-9),
        editablePalletAmount,
        idAuto,
      ),
    );

    const createPalletEvent = {
      text: "Creando registro de Pallet: " + palletIdentifier,
      timestamp: new Date().toISOString(),
    };
    notifyPalletScanned(palletIdentifier);

    dispatch(addEventToPaletizationLog(createPalletEvent));
  }

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

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
  // useEffect(() => {
  //   setTimeout(() => {
  //     localStorage.removeItem("b-gantt-trial-start");
  //     window.location.reload();
  //   }, 60000);

  // }, []);

  function handleClickNewPallet() {
    // Reiniciar el estado del pallet anterior (igual que "Nuevo" o al escanear
    // un pallet). Sin esto, hasProcessed quedaba en true tras procesar el pallet
    // anterior y el botón "Procesar" del nuevo pallet nunca se habilitaba.
    resetPalletState();
    getLastPallet()
      .then((result) => {
        const { nuevoIdentificador, id } = result;
        // Hacer algo con el nuevo identificador recibido
        console.log("El nuevo identificador es:", nuevoIdentificador);
        setBarcodePallet(nuevoIdentificador);
        setPalletIntermedio(nuevoIdentificador);
        dispatch(
          setPallet({
            identifier: nuevoIdentificador,
            id: id,
          })
        );
        const codeScannedEvent = {
          text: "Nuevo pallet: " + nuevoIdentificador,
          timestamp: new Date().toISOString(),
        };
        dispatch(addEventToPaletizationLog(codeScannedEvent));
        setIdAuto(id);
        try { 
          handleCreatePallet(nuevoIdentificador);
        } catch (error) {
          console.error("Hubo un error al crear el pallet:", error);
        }
        
      })
      .catch((error) => {
        console.error("Hubo un error:", error);
      });
  }

  // Limpia solo el pallet en curso (componentes, pruebas, modales); la orden
  // seleccionada se conserva.
  function resetPalletState() {
    dispatch(setPallet(null));
    setBarcodePallet("Nuevo pallet");
    setBarcodeProduct("Escanea producto");
    setPalletIntermedio(null);
    setHasProcessed(false);
    setPalletProductMismatchOpen(false);
    setPalletProductMismatchInfo({ expectedProduct: "", scannedProduct: "" });
    setPalletOrderMismatchOpen(false);

    dispatch(setGlobalStatus(""));
    dispatch(setTestResults([]));
    dispatch(setComponentsJoined(false));
    dispatch(setComponents([]));
  }

  // Nuevo pallet: se reinicia todo, incluida la orden, y se pide elegirla de
  // nuevo. Así un pallet nunca arranca con la orden del pallet anterior.
  function handleNew() {
    console.log("Handle new step");
    resetPalletState();
    dispatch(setOrderSelected({}));
    dispatch(setMetadataOrderSelected([]));
    prevAufnrRef.current = undefined;
    const handleNewEvent = {
      text: "Comando NUEVO detectado. Proceso reiniciado; selecciona la orden del nuevo pallet.",
      timestamp: new Date().toISOString(),
    };
    dispatch(addEventToPaletizationLog(handleNewEvent));
    requestOpenOrders();
  }

  async function handleNotify() {
    if (exceedsOrderSpace) {
      notifyError(
        "No se puede notificar: el pallet tiene " +
          pendingToNotify +
          " piezas por notificar y la orden " +
          orderSelected.aufnr +
          " solo admite " +
          orderRemaining +
          "."
      );
      dispatch(
        addEventToPaletizationLog({
          text:
            "Procesar RECHAZADO: cantidad a notificar (" +
            pendingToNotify +
            ") excede el espacio de la orden " +
            orderSelected.aufnr +
            " (" +
            orderRemaining +
            ").",
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }
    setHasProcessed(true);
    const ok = await dispatch(processInSAP(orderSelected, palletSelected, componentsList));
    if (ok) {
      // SAP aceptó el pallet: reiniciar de cero para el siguiente. Se da un
      // momento para que el operador vea la confirmación en pantalla.
      const palletId = palletSelected?.identifier;
      setTimeout(() => {
        resetPalletState();
        dispatch(setOrderSelected({}));
        dispatch(setMetadataOrderSelected([]));
        prevAufnrRef.current = undefined;
        dispatch(
          addEventToPaletizationLog({
            text:
              "Pallet " +
              palletId +
              " notificado a SAP. Proceso reiniciado; selecciona la orden del siguiente pallet.",
            timestamp: new Date().toISOString(),
          })
        );
        requestOpenOrders();
      }, 2500);
    }
  }

  const handlePalletAmountDoubleClick = () => {
    setPalletAmountPasswordInput("");
    setPalletAmountPasswordError(false);
    setPalletAmountPasswordOpen(true);
  };

  const handleValidatePalletAmountPassword = () => {
    if (palletAmountPasswordInput === PALLET_AMOUNT_PASSWORD) {
      setPalletAmountPasswordError(false);
      setPalletAmountPasswordInput("");
      setPalletAmountPasswordOpen(false);
      setIsEditingPalletAmount(true); // contraseña correcta: habilitar edición
    } else {
      setPalletAmountPasswordError(true);
    }
  };

  const validateAndApplyPalletAmount = (rawValue) => {
    let parsedValue = Number(rawValue);

    if (Number.isNaN(parsedValue) || parsedValue < 1) {
      parsedValue = 1;
    }

    if (parsedValue < componentsList.length) {
      notifyError(
        "La cantidad por pallet no puede ser menor al total montados"
      );
      parsedValue = Math.max(componentsList.length, 1);
    }

    setEditablePalletAmount(parsedValue);
    dispatch(setPalletAmount(parsedValue));
  };

  const handlePalletAmountChange = (e) => {
    setEditablePalletAmount(e.target.value);
  };

  const handlePalletAmountBlur = () => {
    setIsEditingPalletAmount(false);
    validateAndApplyPalletAmount(editablePalletAmount);
  };

  const handlePalletAmountKeyPress = (e) => {
    if (e.key === "Enter") {
      setIsEditingPalletAmount(false);
      validateAndApplyPalletAmount(editablePalletAmount);
    }
  };

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

  // Ajustar "Cantidad pallet" automáticamente según el producto de la orden.
  // Se ejecuta solo cuando cambia el producto (matnr), de modo que una edición
  // manual del operador se conserva hasta que seleccione otro producto.
  useEffect(() => {
    if (!orderSelected?.matnr) return;
    const quantity = getPalletQuantityForProduct(orderSelected.matnr);
    setEditablePalletAmount(quantity);
    dispatch(setPalletAmount(quantity));
  }, [orderSelected?.matnr]);

  useEffect(() => {
    // Checkear si el pallet seleccionado es null
    if (palletSelected === null) {
      setBarcodePallet("Nuevo pallet");
      setPalletIntermedio(null);
    }
    if (palletSelected?.identifier) {
      setBarcodePallet(palletSelected.identifier);
      setPalletIntermedio(palletSelected.identifier);
    }
  }, [palletSelected, barcodePallet]);

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-10xl mx-auto">
        <div className="max-w-full mx-4 py-0 sm:mx-auto sm:px-6 lg:px-4">
          <header>
            <div className="mt-8">
              <div className="flex items-center justify-between h-16 -mb-px">
                <h3 className="text-black text-2xl capitalize font-semibold text-gray-400 tracking-tight">
                  Paletización
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
                  <div>
                    <div style={{ display: "none" }}>
                      <LabelPrinting
                        ref={labelRef}
                        pallet={
                          barcodePallet != "Nuevo pallet"
                            ? barcodePallet
                            : "Undefined"
                        }
                        qty={
                          componentsList.length > 0
                            ? componentsList.length
                            : "Undefined"
                        }
                        order={
                          Object.keys(orderSelected).length != 0
                            ? orderSelected.aufnr
                            : "Undefined"
                        }
                        product={
                          Object.keys(orderSelected).length != 0
                            ? orderSelected.matnr
                            : "Undefined"
                        }
                      />
                    </div>
                  </div>
                  <BrowserPrintComponent
                    barcodeProduct={barcodeProduct}
                    pallet={
                      barcodePallet != "Nuevo pallet"
                        ? barcodePallet
                        : "Undefined"
                    }
                    qty={
                      componentsList.length > 0
                        ? componentsList.length
                        : "Undefined"
                    }
                    order={
                      Object.keys(orderSelected).length != 0
                        ? orderSelected.aufnr
                        : "Undefined"
                    }
                    product={
                      Object.keys(orderSelected).length != 0
                        ? orderSelected.matnr
                        : "Undefined"
                    }
                  />
                  {componentsList.length === 0 ? null : isLoading ? (
                    <button
                      onClick={handleNotify}
                      className={
                        "w-64 h-12 btn bg-primary text-white disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-none"
                      }
                      disabled={true}
                    >
                      <svg
                        className="animate-spin bg-transparent w-4 h-4 fill-current shrink-0 mr-2"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 16a7.928 7.928 0 01-3.428-.77l.857-1.807A6.006 6.006 0 0014 8c0-3.309-2.691-6-6-6a6.006 6.006 0 00-5.422 8.572l-1.806.859A7.929 7.929 0 010 8c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
                      </svg>
                      <span className="bg-transparent my-auto text-white font-semibold">
                        Cargando...
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        handleNotify();
                        e.currentTarget.blur();
                      }}
                      className={
                        // Si la cantidad del pallet no coincide con el total montado,
                        // O ya están todos enviados a SAP,
                        // O el pallet ya fue notificado exitosamente en SAP (sap_success === true),
                        // O ya se intentó procesar en esta sesión,
                        // mostramos el estilo desactivado (gris/secundario)
                        hasProcessed ||
                        componentsList.length !== Number(editablePalletAmount) ||
                        palletSelected?.sap_success ||
                        exceedsOrderSpace
                          ? "w-64 h-12 bg-secondary rounded text-slate-400 text-base flex justify-center cursor-not-allowed opacity-70"
                          : "w-64 h-12 bg-primary rounded text-white text-base flex justify-center hover:bg-green-500"
                      }
                      disabled={
                        // El botón se bloquea si: ya se procesó (éxito o error),
                        // O la cantidad de pallet no coincide con el total montado,
                        // O NO hay nada pendiente por enviar a SAP,
                        // O el pallet ya fue procesado exitosamente en SAP
                        hasProcessed ||
                        componentsList.length !== Number(editablePalletAmount) ||
                        palletSelected?.sap_success ||
                        exceedsOrderSpace
                      }
                    >
                      <span className="bg-transparent my-auto text-white font-semibold">
                        Procesar
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>
          {/* Mostrar un alert si el pallet ya fue notificado en SAP */}
          {palletSelected?.sap_success ? (
            <div className="mt-2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">Este pallet ya fue procesado. Haz click en el botón "Nuevo" para crear un nuevo pallet o "Continuar pallet" para reanudar el proceso en otro pallet.</span>
            </div>
          ) : (
            null
          )}
          {/* La cantidad a notificar excede el espacio de la orden en SAP */}
          {exceedsOrderSpace && (
            <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">
                El pallet tiene <b>{pendingToNotify}</b> piezas por notificar, pero la orden{" "}
                <b>{orderSelected.aufnr}</b> solo admite <b>{orderRemaining}</b> más en SAP
                (planeado {orderSelected.qtdpl}, apuntado {orderSelected.qtdpr}). No se puede
                procesar hasta desmontar el excedente o cambiar de orden.
              </span>
            </div>
          )}

          <div className="max-w-full mx-4 py-0 sm:mx-auto">
            <div className="sm:flex sm:space-x-4">
              {Object.keys(orderSelected).length === 0 ? (
                <section className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full xl:w-1/3 xl:my-4 md:w-1/4 md:my-4">
                  <div className="bg-white xl:p-5 md:p-3">
                    <div className="sm:flex sm:items-start bg-white">
                      <div className="bg-white text-center sm:mt-0 sm:ml-2 sm:text-left">
                        <div className="flex items-center">
                          <Grid8 className="mr-2" color="#A0A2A6" size={20} />
                          <h3 className="bg-white text-md font-medium text-gray">
                            Pallet
                          </h3>
                        </div>
                        <p className="bg-white xl:text-3xl md:text-lg font-bold text-black">
                          {Object.keys(orderSelected).length === 0
                            ? "Selecciona órden"
                            : barcodePallet}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
                <button
                  onClick={handleClickNewPallet}
                  className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full xl:w-1/3 xl:my-4 md:w-1/4 md:my-4"
                >
                  <div className="bg-white xl:p-5 md:p-3">
                    <div className="sm:flex sm:items-start bg-white">
                      <div className="bg-white text-center sm:mt-0 sm:ml-2 sm:text-left">
                        <div className="flex items-center">
                          <Grid8 className="mr-2" color="#A0A2A6" size={20} />
                          <h3 className="bg-white text-md font-medium text-gray">
                            Pallet
                          </h3>
                        </div>
                        <p className="bg-white xl:text-3xl md:text-lg font-bold text-black">
                          {Object.keys(orderSelected).length === 0
                            ? "Selecciona órden"
                            : barcodePallet}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              )}

              <section className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full sm:w-1/3 sm:my-4">
                <div className="bg-white p-5">
                  <div className="sm:flex sm:items-start bg-white">
                    <div className="bg-white text-center sm:mt-0 sm:ml-2 sm:text-left">
                      <div className="flex items-center">
                        <Category className="mr-2" color="#A0A2A6" size={20} />
                        <h3 className="bg-white text-md font-medium text-gray">
                          Número serial actual
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

              <section className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full sm:w-1/6 sm:my-4">
                <div className="bg-white p-5">
                  <div className="sm:flex sm:items-start bg-white">
                    <div className="bg-white text-center sm:mt-0 sm:ml-2 sm:text-left">
                      <div className="flex items-center">
                        <HashtagSquare
                          variant="Outline"
                          className="mr-2"
                          color="#A0A2A6"
                          size={20}
                        />
                        <h3 className="bg-white text-md font-medium text-gray">
                          Cantidad pallet
                        </h3>
                      </div>

                      <p className="bg-white text-3xl font-bold text-black">
                        {isEditingPalletAmount ? (
                          <input
                            type="number"
                            value={editablePalletAmount}
                            onChange={handlePalletAmountChange}
                            onBlur={handlePalletAmountBlur}
                            onKeyPress={handlePalletAmountKeyPress}
                            className="bg-transparent border-b-2 border-blue-500 outline-none text-3xl font-bold text-black w-20"
                            autoFocus
                            min="1"
                          />
                        ) : (
                          <span
                            onDoubleClick={handlePalletAmountDoubleClick}
                            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                            title="Doble clic para editar (requiere contraseña)"
                          >
                            {editablePalletAmount}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full sm:w-1/6 sm:my-4">
                <div className="bg-white p-5">
                  <div className="sm:flex sm:items-start bg-white">
                    <div className="bg-white text-center sm:mt-0 sm:ml-2 sm:text-left">
                      <div className="flex items-center">
                        <Health className="mr-2" color="#A0A2A6" size={20} />
                        <h3 className="bg-white text-md font-medium text-gray">
                          Total montados
                        </h3>
                      </div>

                      <p className="bg-white text-3xl font-bold text-black">
                        {Object.keys(orderSelected).length === 0
                          ? "--------"
                          : componentsList.length}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div className="sm:flex sm:space-x-4">
              <div
                className="flex flex-col w-1/3"
                style={{ paddingRight: "7px" }}
              >
                <section className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full sm:my-4">
                  <div className="bg-white p-5">
                    <div className="sm:flex sm:items-start bg-white">
                      <div className="bg-white text-center sm:mt-0 sm:ml-2 sm:text-left">
                        <div className="flex items-center">
                          <Notepad2
                            className="mr-2"
                            color="#A0A2A6"
                            size={20}
                          />
                          <h3 className="bg-white text-md font-medium text-gray">
                            Órden
                          </h3>
                        </div>
                        <p className="bg-white text-3xl font-bold text-black">
                          {Object.keys(orderSelected).length === 0
                            ? "Selecciona órden"
                            : orderSelected.aufnr}
                        </p>
                        {orderRemaining !== null && (
                          <p
                            className={`bg-white text-sm font-medium mt-1 ${
                              exceedsOrderSpace ? "text-red-600" : "text-slate-500"
                            }`}
                          >
                            Pendientes en SAP: {orderRemaining}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full sm:my-4">
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
              </div>

              <section
                ref={componentsSectionRef}
                style={{
                  maxHeight: "645px",
                  minHeight: "200px",
                  overflowY: "scroll",
                }}
                className="inline-block align-bottom rounded-lg border border-slate-200 text-left overflow-hidden mb-4 w-full sm:my-4 w-3/4"
              >
                <div className="bg-white p-5">
                  <h3 className="bg-white text-md font-medium text-gray">
                    Listado de componentes
                  </h3>
                  <div className="flex justify-start" style={{ marginLeft: "-10px" }}>
                    <ComponentsTable
                      selectedItems={handleSelectedItems}
                      palletIdentifier={
                        palletIntermedio ||
                        palletSelected?.identifier ||
                        (barcodePallet !== "Nuevo pallet" ? barcodePallet : undefined)
                      }
                    />
                    <div></div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <hr className="solid" />
          <div className="mt-8 flex">
            <h3 className="text-black text-2xl capitalize font-semibold text-gray-400 tracking-tight">
              Información adicional
            </h3>
          </div>

          <div className="sm:flex sm:space-x-4 mt-4">
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
                  {paletizationLog
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
          </div>
        </div>
      </div>

      <PalletProductMismatchModal
        open={palletProductMismatchOpen}
        onClose={() => setPalletProductMismatchOpen(false)}
        expectedProduct={palletProductMismatchInfo.expectedProduct}
        scannedProduct={palletProductMismatchInfo.scannedProduct}
      />

      <PalletOrderMismatchModal
        open={palletOrderMismatchOpen}
        onClose={() => setPalletOrderMismatchOpen(false)}
        pallet={palletOrderMismatchInfo.pallet}
        palletOrder={palletOrderMismatchInfo.palletOrder}
        selectedOrder={palletOrderMismatchInfo.selectedOrder}
        onChangeOrder={handleRequestChangeOrder}
      />

      {/* Contraseña de administrador para reasignar la orden del pallet */}
      <ModalBlank
        id="change-order-password-modal"
        modalOpen={changeOrderPasswordOpen}
        setModalOpen={setChangeOrderPasswordOpen}
      >
        <div className="p-5 flex space-x-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-secondary">
            <svg
              className="w-4 h-4 shrink-0 fill-current text-primary"
              viewBox="0 0 16 16"
            >
              <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v5z" />
            </svg>
          </div>
          <div className="w-full">
            <div className="mb-2">
              <div className="text-lg font-semibold text-slate-800">
                Cambiar la orden del pallet
              </div>
            </div>
            <div className="text-sm mb-6">
              <p className="text-black">
                El pallet{" "}
                <span className="font-mono font-semibold">{palletOrderMismatchInfo.pallet}</span>{" "}
                pasará de la orden{" "}
                <span className="font-semibold">{palletOrderMismatchInfo.palletOrder}</span> a la
                orden <span className="font-semibold">{orderSelected?.aufnr}</span>. Ingresa la
                contraseña de administrador para autorizarlo.
              </p>
              <div className="mt-4">
                <input
                  type="password"
                  autoFocus
                  value={changeOrderPasswordInput}
                  onChange={(e) => {
                    setChangeOrderPasswordInput(e.target.value);
                    if (changeOrderPasswordError) setChangeOrderPasswordError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleConfirmChangeOrder();
                    }
                  }}
                  className="form-input w-full h-12"
                  placeholder="Contraseña"
                />
                {changeOrderPasswordError && (
                  <p className="text-sm text-red-500 mt-2">Contraseña incorrecta.</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-end space-x-2">
              <button
                className="btn-sm border-slate-200 hover:border-slate-300 text-slate-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setChangeOrderPasswordOpen(false);
                }}
              >
                Cancelar
              </button>
              <button
                className="btn-sm bg-primary hover:bg-primary-500 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmChangeOrder();
                }}
              >
                Cambiar orden
              </button>
            </div>
          </div>
        </div>
      </ModalBlank>

      {/* Password Modal (bloqueo previo a editar la cantidad de pallet) */}
      <ModalBlank
        id="pallet-amount-password-modal"
        modalOpen={palletAmountPasswordOpen}
        setModalOpen={setPalletAmountPasswordOpen}
      >
        <div className="p-5 flex space-x-4">
          {/* Icon */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-secondary">
            <svg
              className="w-4 h-4 shrink-0 fill-current text-primary"
              viewBox="0 0 16 16"
            >
              <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v5z" />
            </svg>
          </div>
          {/* Content */}
          <div className="w-full">
            {/* Modal header */}
            <div className="mb-2">
              <div className="text-lg font-semibold text-slate-800">
                Contraseña requerida
              </div>
            </div>
            {/* Modal content */}
            <div className="text-sm mb-6">
              <p className="text-black">
                Ingresa la contraseña para modificar la cantidad de piezas por
                pallet.
              </p>
              <div className="mt-4">
                <input
                  type="password"
                  autoFocus
                  value={palletAmountPasswordInput}
                  onChange={(e) => {
                    setPalletAmountPasswordInput(e.target.value);
                    if (palletAmountPasswordError)
                      setPalletAmountPasswordError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleValidatePalletAmountPassword();
                    }
                  }}
                  className="form-input w-full h-12"
                  placeholder="Contraseña"
                />
                {palletAmountPasswordError && (
                  <p className="text-sm text-red-500 mt-2">
                    Contraseña incorrecta.
                  </p>
                )}
              </div>
            </div>
            {/* Modal footer */}
            <div className="flex flex-wrap justify-end space-x-2">
              <button
                className="btn-sm border-slate-200 hover:border-slate-300 text-slate-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setPalletAmountPasswordOpen(false);
                }}
              >
                Cancelar
              </button>
              <button
                className="btn-sm bg-primary hover:bg-primary-500 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleValidatePalletAmountPassword();
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </ModalBlank>

      <ModalBlank
        id="info-modal"
        modalOpen={infoModalOpen}
        setModalOpen={setInfoModalOpen}
      >
        <div className="p-5 flex space-x-4">
          {/* Icon */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-rose-100">
            <svg
              className="w-4 h-4 shrink-0 fill-current text-rose-500"
              viewBox="0 0 16 16"
            >
              <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 12H7V7h2v5zM8 6c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
            </svg>
          </div>
          {/* Content */}
          <div>
            {/* Modal header */}
            <div className="mb-2">
              <div className="text-lg font-semibold text-slate-800 text-left">
                No es posible montar {barcodeProduct}
              </div>
            </div>
            {/* Modal content */}
            <div className="text-sm mb-10 text-left">
              <div className="space-y-2">
                <p>
                  El componente no puede ser montado ya que hay uno o más
                  errores en sus pruebas, es posible que el componente se
                  encuentre dañado:
                </p>
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
                        currentStepIndex={2}
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
            </div>
            {/* Modal footer */}
            <div className="flex flex-wrap justify-end">
              <button
                className="btn-sm bg-primary hover:primary text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setInfoModalOpen(false);
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      </ModalBlank>
    </>
  );
}

export default PaletizationView;
