import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import axios from "axios";
import { Print_Service } from "./printService";
import { useSelector } from "react-redux";
import {
  selectSelectedAccessories,
  selectSelectedProduct,
  selectQrCode,
  barcodeProduct,
} from "./store/slice/productSlice";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    "& button": {
      flexBasis: "70%",
      margin: "2%",
      backgroundColor: "rgb(0 155 74 / var(--tw-bg-opacity))",
      color: "white",
      "&:hover": {
        backgroundColor: "rgb(0 120 56 / var(--tw-bg-opacity))",
      },
    },
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  formControl: {
    marginTop: "5%",
    marginBottom: "7%",
    minWidth: 140,
  },
}));

export default function PrinterComponent() {
  const classes = useStyles();

  // States
  const [open, setOpen] = useState(false);
  const [deviceList, setDevices] = useState([]);
  const [printer, setPrinter] = useState(null);
  const [zebraPrinter, setZebraPrinter] = useState(null);

  // Obtener datos de Redux
  const selectedProduct = useSelector(selectSelectedProduct); // Acceder al producto seleccionado
  const selectedAccessories = useSelector(selectSelectedAccessories); // Acceder a los accesorios seleccionados
  const qrCode = useSelector(selectQrCode); // Acceder al código QR si es necesario
  //const barcodeProduct_pp = useSelector(barcodeProduct); // Acceder al producto de código de barras
  const barcodeProduct = useSelector(selectBarcodeProduct);
  useEffect(() => {
    window.BrowserPrint.getLocalDevices(
      function (deviceList) {
        setDevices(deviceList.printer);
      },
      (err) => {
        console.log(err);
      }
    );
  }, []);

  const handleChange = (event) => {
    setPrinter(event.target.value);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleStatusCheck = () => {};

  const writeIframe = (str) => {
    const doc = document.getElementById("info").contentWindow.document;
    doc.open();
    doc.write(str);
    doc.close();
  };

  const handleList = () => {
    let str = "";
    deviceList.map((device) => {
      str += `<li>${device.name}</li>`;
    });
    writeIframe(str);
  };

  const checkConfig = () => {};

  function formatZPLDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  // Lógica para imprimir accesorios
  const handlePrintAccesories = () => {
    console.log("selectedAccessories", selectedAccessories);
    const selectedAccessoriesJson = JSON.parse(selectedAccessories);
    if (!selectedAccessoriesJson) {
      alert("No es posible generar etiqueta de Accesorios, el producto no tiene relación");
    } else {
      console.log(selectedAccessoriesJson[0].matnr);
      let currentDateZPL = formatZPLDate(new Date(Date.now()));

      let networkCallResponse = `
   ^XA
   ; Código ZPL para accesorios
   ^FO380,900^GFA,1136,1136,8,,O07FC,...
   ^XZ
      `;
      Print_Service.print(printer, networkCallResponse);
    }
  };

  // Lógica para obtener QR Thermo
  const handlePrintQRThermo = async () => {
    console.log("HDR handlePrintQRThermo1");

    let qr = "Hola";
    let v_serialNo = selectedProduct; // Aquí usamos selectedProduct desde Redux
    console.log("serialNo", v_serialNo);

    const serialNo = {
      serialNo: v_serialNo,
    };

    try {
      const response = await axios.post(
        "http://em10vs0010.embraco.com:8002/api/v1/paletization/thermo/get_qr/",
        serialNo
      );
      qr = JSON.stringify(response.data);
      console.log("QR obtenido:", qr);
    } catch (error) {
      console.log("Error al obtener QR:", error);
    }

    let networkCallResponse = `
   ^XA
   ^FO100,100^BQN,3,3^FDQA,${qr}^FS
   ^XZ
    `;

    console.log(networkCallResponse);
    Print_Service.print(printer, networkCallResponse);
  };

  const handlePrint = () => {
    console.log(".... HANDLE PRINT FUNCTION ... .");
    console.log("selectedProduct:", selectedProduct);
    console.log("selectedAccessories", selectedAccessories);
    let currentDateZPL = formatZPLDate(new Date(Date.now()));

    let networkCallResponse = `
   ^XA
   ; Código ZPL para impresión
   ^FO380,130^GFA,1136,1136,8,,O07FC,...
   ^XZ
    `;

    Print_Service.print(printer, networkCallResponse);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-dialog-select-label">Impresoras</InputLabel>
        <Select
          labelId="demo-dialog-select-label"
          id="demo-dialog-select"
          value={printer}
          onChange={handleChange}
          input={<Input />}
          MenuProps={{
            getContentAnchorEl: null,
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            PaperProps: {
              style: {
                color: "black",
              },
            },
          }}
        >
          {deviceList.map((device, indx) => (
            <MenuItem value={device} key={indx} style={{ color: "black" }}>
              {device.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className={classes.root}>
        <Button
          onClick={handlePrintAccesories}
          className="w-64 h-12 rounded text-base flex justify-center hover:bg-green-500"
          variant="contained"
          disabled={!printer}
        >
          Imprimir Accesorios
        </Button>
      </div>
      <div className={classes.root}>
        <Button
          onClick={handlePrintQRThermo}
          className="w-64 h-12 rounded text-base flex justify-center hover:bg-green-500"
          variant="contained"
          disabled={!printer}
        >
          Imprimir QR Thermo
        </Button>
      </div>
    </>
  );
}
