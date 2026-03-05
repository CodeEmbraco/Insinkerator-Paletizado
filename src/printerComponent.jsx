import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Print_Service } from "./printService";

import { selectBarcodeProduct } from "./store/slice/productSlice";
import { selectGlobalStatus } from "./store/slice/testResultSlice";

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

export default function PrinterComponent({
  barcodeProduct,
  product,
  qty,
  pallet,
  order,
}) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [deviceList, setDevices] = React.useState([]);
  const [printer, setPrinter] = React.useState(null);

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

  const writeIframe = (str) => {
    var doc = document.getElementById("info").contentWindow.document;
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
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let day = date.getDate().toString().padStart(2, "0");
    let hours = date.getHours().toString().padStart(2, "0");
    let minutes = date.getMinutes().toString().padStart(2, "0");
    let seconds = date.getSeconds().toString().padStart(2, "0");
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  const handlePrintAccesories = () => {
    console.log("selectedAccessories", selectedAccessories);
    const selectedAccessoriesJson = JSON.parse(selectedAccessories);
    if (selectedAccessoriesJson == null)
      alert(
        "No es posible generar etiqueta de Accesorios, el producto no tiene relacion"
      );
    else {
      console.log(selectedAccessoriesJson[0].matnr);
      let currentDateZPL = formatZPLDate(new Date(Date.now()));

      let networkCallResponse = `
   ^XA

^FO380,900^GFA,1136,1136,8,,O07FC,N01IF,N07IFC,N07IFE,N0FCF3E,N0F071F,M01E070F,M01E0707,:M01C0707,:M01E0707,M01E070F,N0E073F,N0F07FE,N0E07FC,P07F8,P01E,,:N0JFC,M01JFE,M01KF,:N0BJF,R0F,CQ07,18P07,03P07,006O0F,I0CN0F,I0F8L01F,003FEL03E,00FFE001JFE,01FFE001JFC,07FFE001JFE,1IFE001JFE,3IFEM0F,JFEM0F,JF8M07,JFN07,IFCN0F,IFO0F,FFEO0F,FF8N01F,0FO0FE,01K01JFE,E02K0JFC,FC06I01JF8,FF80CI0IF8,IF,:IF1C,IF1EI0MF,3FF1E001MF,03F1E001MF,4071E001MF,F801E001EI0F,FF00E001CI0F,FFEJ01CI07,IFJ01CI07,:IFJ01EI07,IFJ01EI0F,8FFK0EI0F,81FK0F001F,F01K0FC07E,FEL07IFE,FFDK03IFC,IF8J01IF8,JFK07FE,JFE,:1IFE,03FFE001JFE,E03FE001KF,FC07E001KF,FF80E001KF,FFEO0F,IFO07,:::87FO07,82FO07,801K03F805,83L07FC,83FK0FFE,83FK0FFE07,83FJ01F0F07,83FJ01E0F07,03FJ01C0707,:01FJ01C0707,E03J01C0707,FCK01C070F,FF8J01E070F,IFJ01E0F1F,IFK0JFE,:IFK0JFC,DFFK07IF,83F,807,801,8N07FC,8M03IF,8M07IF8,8M07IFC,8M0FC07E,N0F001F,M01EI0F,:M01EI07,::M01EI0F,:N0FI0E,:N0F8,N07F,N03FFC,N01IF,O07FFC,N041FFC,N0E007E,N0F001F,M01EI0F,M01EI07,:::M01EI0F,N0FI0F,N0F803E,N0JFE,N07IFC,N03IF8,O0FFE,P04,^FS


^FWR  ; Rotar todo el contenido 90 grados en sentido horario

^FO50,50^GB400,1100,2^FS  ; Dibuja el recuadro de 4x11 cm (400x1100 en unidades ZPL)

; Dibuja las líneas horizontales para dividir el recuadro en 5 partes
^FO100,400^GB240,2,2^FS   ; Línea horizontal 1
^FO100,600^GB240,2,2^FS   ; Línea horizontal 1
^FO100,900^GB240,2,2^FS   ; Línea horizontal 1
^FO100,1100^GB240,2,2^FS   ; Línea horizontal 1

; Dibuja las líneas verticales para dividir el recuadro en 3 partes
^FO100,400^GB2,700,2^FS    ; Línea vertical 1
^FO140,400^GB2,700,2^FS    ; Línea vertical 2
^FO180,400^GB2,700,2^FS    ; Línea vertical 3
^FO220,400^GB2,700,2^FS    ; Línea vertical 4
^FO260,400^GB2,700,2^FS    ; Línea vertical 5
^FO300,400^GB2,700,2^FS    ; Línea vertical 6
^FO340,400^GB2,700,2^FS    ; Línea vertical 7


; Agrega texto en cada sección
^FO350,90^A0R,20,20^FD^FS
^FO380,60^A0R,50,50^FDProducto^FS

^FO300,450^A0R,25,25^FDSKU^FS
^FO260,420^A0R,30,30^FD${selectedAccessoriesJson[0].matnr}^FS
^FO220,420^A0R,30,30^FD${selectedAccessoriesJson[1].matnr}^FS
^FO180,420^A0R,30,30^FD${selectedAccessoriesJson[2].matnr}^FS
^FO140,420^A0R,30,30^FD${selectedAccessoriesJson[3].matnr}^FS
^FO100,420^A0R,30,30^FD${selectedAccessoriesJson[4].matnr}^FS

^FO300,670^A0R,25,25^FDCOMPONENT^FS
^FO260,610^A0R,25,25^FD${selectedAccessories[0].maktx}^FS
^FO220,610^A0R,25,25^FD${selectedAccessories[1].maktx}^FS
^FO180,610^A0R,25,25^FD${selectedAccessories[2].maktx}^FS
^FO140,610^A0R,25,25^FD${selectedAccessories[3].maktx}^FS
^FO100,610^A0R,25,25^FD${selectedAccessories[4].maktx}^FS

^FO300,940^A0R,25,25^FDQUANTITY^FS
^FO260,910^A0R,25,25^FD${selectedAccessories[0].quantity}^FS
^FO220,910^A0R,25,25^FD${selectedAccessories[1].quantity}^FS
^FO180,910^A0R,25,25^FD${selectedAccessories[2].quantity}^FS
^FO140,910^A0R,25,25^FD${selectedAccessories[3].quantity}^FS
^FO100,910^A0R,25,25^FD${selectedAccessories[4].quantity}^FS
; Agrega el código QR en la parte derecha
^FO100,100^BQN,6,6
^FDQA,#CODIGO1|CODIGO1|CODIGO1|CODIGO1|CODIGO1|CODIGO1|CODIGO1|CODIGO1|CO2|^FS

^XZ
    
    `;
    }
    Print_Service.print(printer, networkCallResponse);
  };

  const getQRThermo = (serialNo) => (dispatch) => {
    const serialNo = {
      serialNo: serialNo,
    };
    console.log("HDR Estoy en getQRThermo");
    axios
      .post(
        "http://em10vs0010.embraco.com:8002/api/v1/paletization/thermo/get_qr/",
        serialNo
      )
      .then((response) => {
        if (response.status === 201) {
          console.log("QR Thermo obtenido con exito:", response.data);

          // dispatch(setPallet(response.data));
        } else if (response.status === 200) {
          console.log("QR thermo no obtenido", response.data);
          //dispatch(setPallet(response.data));
          //const palletIdentifier = response.data.identifier;
          //console.log(palletIdentifier);
          //dispatch(getAllComponents(palletIdentifier));
        }
      })
      .catch((error) => endpointsCodes(error, dispatch, setNotFound));
  };

  const barcodeProduct_pp = useSelector(selectBarcodeProduct); // ✔ permitido

  const handlePrintQRThermo = async () => {
    //const barcodeProduct_pp = useSelector(selectBarcodeProduct); // Acceder al producto de código de barras
    console.log("HDR handlePrintQRThermo1");
    let part_number = barcodeProduct.slice(0, 9);
    //const barcodeProduct_pp = useSelector(barcodeProduct);
    console.log({ barcodeProduct });
    let qr = "Hola";
    let format_qr= qr;
    let v_serialNo = barcodeProduct.slice(9);
    console.log("serialNo", v_serialNo);
    //v_serialNo = "8C5XHIGH";
    const serialNo = {
      serialNo: v_serialNo,
    };

    let currentDateZPL = formatZPLDate(new Date(Date.now()));

    const response = await axios.post(
      "http://em10vs0010.embraco.com:8002/api/v1/paletization/thermo/get_qr/",
      serialNo
    );
    qr = JSON.stringify(response.data);
    console.log(qr);

    //console.log("Error en la API:", error);

    console.log("HDR handlePrintQRThermo2..");
    //axios
    //  .post("http://localhost:9003/api/v1/paletization/thermo/get_qr/", serialNo)
    //   .then((response) => {

    //qr = JSON.stringify(response.data);


    //format_qr = qr.translate(str.maketrans("", "", ',[]": '))
    //qr = '["Compressor1 PN: 513805037...L","Compressor1 SN: JC5BPOIL","Compressor2 PN: 513805037...L","Compressor2 SN: JC5BPOJF","Inverter PN: 519301201","Inverter SN: 2154","Inverter PN: 519301201","Inverter SN: 2160","Fan PN: 517009997","Fan SN: AN7","Cold Box PN: 15251677","Cold Box SN: 001201125","RE  PN: 215251070","RE  SN: 8C5VLGH1","Assembly PN: 515380100","Assembly SN: 8C5XHIGH","ExpansionHub PN: 519501008","ExpansionHub SN: 001D","Captube Back Pressure: 105.0","Captube Flow: 40.8","Captube Length: 919.0"]';

    let resultado = qr
                    .replace(/[\[\]]/g, '')  // elimina [ y ]
                    .replace(/"/g, ' ')      // reemplaza comillas
                    .replace(/:/g, ',')      // reemplaza :
                    .replace(/\s+/g, '');    // elimina espacios

    console.log(resultado);

    format_qr = resultado
    //format_qr = "".join(format_qr.split())

    print(format_qr)
    /*format_qr = qr.replace(",", "");  //Elimina las comas
    format_qr = format_qr.replace("[","");
    format_qr = format_qr.replace("]","");
    format_qr = format_qr.replace(/"/g, "");
    format_qr = format_qr.replace(":","");
    format_qr = format_qr.replace(" ","");*/
    console.log(format_qr);



    //if (response.status === 201) {
    //  console.log("QR Thermo obtenido con exito:", response.data);

    // dispatch(setPallet(response.data));
    //} else if (response.status === 200) {
    //  console.log("QR thermo no obtenido", response.data);
    //dispatch(setPallet(response.data));
    //const palletIdentifier = response.data.identifier;
    //console.log(palletIdentifier);
    //dispatch(getAllComponents(palletIdentifier));
    //}
    //})
    // .catch((error) => endpointsCodes(error, dispatch, setNotFound));
    //console.log("selectedAccessories", selectedAccessories);
    //const selectedAccessoriesJson = JSON.parse(selectedAccessories);
    //if ( selectedAccessoriesJson == null )
    //  alert("No es posible generar etiqueta de Accesorios, el producto no tiene relacion");
    //else{
    //console.log(selectedAccessoriesJson[0].matnr);
    //let currentDateZPL = formatZPLDate(new Date(Date.now()));

    let networkCallResponse = `
   ^XA

    ^FO380,900^GFA,1136,1136,8,,O07FC,N01IF,N07IFC,N07IFE,N0FCF3E,N0F071F,M01E070F,M01E0707,:M01C0707,:M01E0707,M01E070F,N0E073F,N0F07FE,N0E07FC,P07F8,P01E,,:N0JFC,M01JFE,M01KF,:N0BJF,R0F,CQ07,18P07,03P07,006O0F,I0CN0F,I0F8L01F,003FEL03E,00FFE001JFE,01FFE001JFC,07FFE001JFE,1IFE001JFE,3IFEM0F,JFEM0F,JF8M07,JFN07,IFCN0F,IFO0F,FFEO0F,FF8N01F,0FO0FE,01K01JFE,E02K0JFC,FC06I01JF8,FF80CI0IF8,IF,:IF1C,IF1EI0MF,3FF1E001MF,03F1E001MF,4071E001MF,F801E001EI0F,FF00E001CI0F,FFEJ01CI07,IFJ01CI07,:IFJ01EI07,IFJ01EI0F,8FFK0EI0F,81FK0F001F,F01K0FC07E,FEL07IFE,FFDK03IFC,IF8J01IF8,JFK07FE,JFE,:1IFE,03FFE001JFE,E03FE001KF,FC07E001KF,FF80E001KF,FFEO0F,IFO07,:::87FO07,82FO07,801K03F805,83L07FC,83FK0FFE,83FK0FFE07,83FJ01F0F07,83FJ01E0F07,03FJ01C0707,:01FJ01C0707,E03J01C0707,FCK01C070F,FF8J01E070F,IFJ01E0F1F,IFK0JFE,:IFK0JFC,DFFK07IF,83F,807,801,8N07FC,8M03IF,8M07IF8,8M07IFC,8M0FC07E,N0F001F,M01EI0F,:M01EI07,::M01EI0F,:N0FI0E,:N0F8,N07F,N03FFC,N01IF,O07FFC,N041FFC,N0E007E,N0F001F,M01EI0F,M01EI07,:::M01EI0F,N0FI0F,N0F803E,N0JFE,N07IFC,N03IF8,O0FFE,P04,^FS


    ^FWR  ; Rotar todo el contenido 90 grados en sentido horario

    ^FO50,50^GB400,1100,2^FS  ; Dibuja el recuadro de 4x11 cm (400x1100 en unidades ZPL)

    ; Agrega texto en cada sección
    ^FO350,90^A0R,20,20^FD^FS

    ^FO300,450^A0R,25,25^FDPart Label^FS
    ^FO240,450^A0R,25,25^FDSerial Number^FS
    ^FO180,450^A0R,30,30^FDRevision Label^FS
    ^FO120,450^A0R,30,30^FDManufacture Date^FS

    ^FO300,700^A0R,25,25^FD${part_number}^FS
    ^FO240,700^A0R,25,25^FD${v_serialNo}^FS
    ^FO180,700^A0R,25,25^FDA^FS
    ^FO120,700^A0R,25,25^FD${currentDateZPL}^FS

    ; Agrega el código QR en la parte derecha
    ^FO100,100^BQN,3,3
    ^FDQA,${format_qr}
    ^FS

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

    ^FO380,130^GFA,1136,1136,8,,O07FC,N01IF,N07IFC,N07IFE,N0FCF3E,N0F071F,M01E070F,M01E0707,:M01C0707,:M01E0707,M01E070F,N0E073F,N0F07FE,N0E07FC,P07F8,P01E,,:N0JFC,M01JFE,M01KF,:N0BJF,R0F,CQ07,18P07,03P07,006O0F,I0CN0F,I0F8L01F,003FEL03E,00FFE001JFE,01FFE001JFC,07FFE001JFE,1IFE001JFE,3IFEM0F,JFEM0F,JF8M07,JFN07,IFCN0F,IFO0F,FFEO0F,FF8N01F,0FO0FE,01K01JFE,E02K0JFC,FC06I01JF8,FF80CI0IF8,IF,:IF1C,IF1EI0MF,3FF1E001MF,03F1E001MF,4071E001MF,F801E001EI0F,FF00E001CI0F,FFEJ01CI07,IFJ01CI07,:IFJ01EI07,IFJ01EI0F,8FFK0EI0F,81FK0F001F,F01K0FC07E,FEL07IFE,FFDK03IFC,IF8J01IF8,JFK07FE,JFE,:1IFE,03FFE001JFE,E03FE001KF,FC07E001KF,FF80E001KF,FFEO0F,IFO07,:::87FO07,82FO07,801K03F805,83L07FC,83FK0FFE,83FK0FFE07,83FJ01F0F07,83FJ01E0F07,03FJ01C0707,:01FJ01C0707,E03J01C0707,FCK01C070F,FF8J01E070F,IFJ01E0F1F,IFK0JFE,:IFK0JFC,DFFK07IF,83F,807,801,8N07FC,8M03IF,8M07IF8,8M07IFC,8M0FC07E,N0F001F,M01EI0F,:M01EI07,::M01EI0F,:N0FI0E,:N0F8,N07F,N03FFC,N01IF,O07FFC,N041FFC,N0E007E,N0F001F,M01EI0F,M01EI07,:::M01EI0F,N0FI0F,N0F803E,N0JFE,N07IFC,N03IF8,O0FFE,P04,^FS

    ^FWR  ; Rotar todo el contenido 90 grados en sentido horario
    
    ^FO50,50^GB400,1100,2^FS  ; Dibuja el recuadro de 4x11 cm (400x1100 en unidades ZPL)
    
    ; Dibuja las líneas horizontales para dividir el recuadro en 5 partes
    ^FO130,50^GB2,1100,2^FS   ; Línea horizontal 1
    ^FO210,50^GB2,720,2^FS   ; Línea horizontal 2
    ^FO290,50^GB2,720,2^FS   ; Línea horizontal 3
    ^FO370,50^GB2,720,2^FS   ; Línea horizontal 4
    
    ; Dibuja las líneas verticales para dividir el recuadro en 3 partes
    ^FO50,393^GB400,2,2^FS    ; Línea vertical 1
    ^FO50,780^GB400,2,2^FS    ; Línea vertical 2
    ^FO220,625^GB80,2,2^FS    ; Línea vertical 2
    
    ; Agrega texto en cada sección
    ^FO60,60^A0R,20,20^FDSTORAGE TEMPERATURE^FS
    ^FO80,60^A0R,40,35^FD${selectedProduct.storage_temp}^FS
    ^FO60,400^A0R,20,20^FDAPODACA, NL^FS
    ^FO80,400^A0R,40,40^FDMexico^FS
    ^FO60,800^A0R,20,20^FDHECHO - MANUFACTURING^FS
    ^FO80,800^A0R,40,20^FD${currentDateZPL}^FS
    
    ^FO140,60^A0R,15,15^FDCODIGO EMBRACO PARTNUMBER^FS
    ^FO160,60^A0R,40,40^FD${selectedProduct.matnr}^FS
    ^FO140,400^A0R,15,15^FDVOLTAGE / FRECUENCIA - VOTAGE / FREQUENCY^FS
    ^FO160,400^A0R,40,40^FD${selectedProduct.voltage}^FS
    
    ^FO220,60^A0R,15,15^FDPOTENCIA WATS^FS
    ^FO240,60^A0R,40,40^FD${selectedProduct.potencia}^FS
    ^FO220,400^A0R,15,15^FDCORRIENTE - CURRENT^FS
    ^FO240,400^A0R,40,40^FD${selectedProduct.corrente}E^FS
    ^FO220,630^A0R,15,15^FDIP RATING^FS
    ^FO240,630^A0R,40,40^FD${selectedProduct.iprating}^FS
    
    ^FO300,60^A0R,20,20^FDSPEED ORIENTATION^FS
    ^FO320,60^A0R,40,40^FD${selectedProduct.speed_conf}^FS
    ^FO300,400^A0R,20,20^FDSPEED ROTATION^FS
    ^FO320,400^A0R,40,40^FD${selectedProduct.speed_rot}^FS
    
    ^FO380,60^A0R,20,20^FD^FS
    ^FO400,60^A0R,40,40^FD^FS
    ^FO380,400^A0R,20,20^FDMODELO^FS
    ^FO400,400^A0R,40,35^FD${selectedProduct.modelo}^FS
    ^FO380,686^A0R,20,20^FD^FS
    ^FO400,686^A0R,40,40^FD^FS
    
    ; Agrega el código QR en la parte derecha
    ^FO150,800^BQN,3,3
    ^FDQA,${qrCode}^FS
    
    ^XZ
    
    `;
    Print_Service.print(printer, networkCallResponse);
  };

  const handlePrintZPLLabel = () => {
    if (!printer) {
      alert("Selecciona una impresora primero");
      return;
    }

    // Lo ideal es que esto sea dinámico y se obtenga desde una API o una base de datos. Esta es una solución temporal.
    const parts_number_client_number = {
      "5180758A": "81202A",
      "5180759A": "81202A",
      "5179611H": "81202K",
      "5178830B": "81202K"
    }

    const clientPartNumber = parts_number_client_number[product.toString()] || "";
    const productValue = product || "";
    const quantity = qty || "";
    const batchOrder = pallet && order ? `${pallet}-${order}` : "";
    const dateLabel = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });

    const zpl = `
^XA
^PW1015
^LL609
^CI28

^CF0,30
^FO50,40^FDClient Part Number^FS
^FO500,40^FDProduct^FS

^CF0,60
^FO50,80^FD${clientPartNumber}^FS
^FO490,80^FD${productValue}^FS

^BY3,2,100
^FO50,150^BCN,100,N,N,N^FD${clientPartNumber}^FS
^FO490,150^BCN,100,N,N,N^FD${productValue}^FS

^CF0,40
^FO50,320^FDQuantity^FS
^FO360,320^FDBatch - Order^FS

^CF0,50
^FO50,360^FD${quantity}^FS
^FO360,360^FD${batchOrder}^FS

^BY3,2,90
^FO60,420^BCN,90,N,N,N^FD${quantity}^FS

^BY3,2,120
^FO310,420^BCN,80,N,N,N^FD${batchOrder}^FS

^CF0,35
^FO380,570^FDDate: ${dateLabel}^FS

^FWB
^FO820,1
^GFA,5124,5124,28,,:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::P07FFK041FFCK0IF8,P07FF8K03FFEK0IF8,P0IFCK07FFCJ01IF,P0IFCJ087FFCJ01IF,P0IFEJ087FFCJ01IF,O01JFK07FFCJ03FFE,O01JFI010IF8J03FFE,O01JF800107FFK03FFE,O03JFCJ03F8K03FFC,O03JFC002O07FFC,O03JFE002O07FFC,O07JFE002O0IF8,P0KF004O0IF8,P0KF0043FFE0MF87LFC1MF,O08KF8043FFE1IF1IF07FFC7FFC1IF8,O087JFC087FFC3FFE1IF0IF87FFC3FFE,O083JFC087FFC3FFE1IF0IF87FFC3FFE,N0103JFE087FFC3FFE3FFE0IF8IF87FFC,N0101JFE00IF87FFC3FFE1IF0IF87FFC,N0101KF10IF87FFC3FFE1IF0IF87FFC,Q0KF90IF87FFC7FFC1IF1IF07FF8,N02007JFD1IF0IF87FFC3FFE1IF0IF8,N02007JFE1IF0IF87FFC3FFE1IF0IF8,N02003JFE1IF0IF87FFC3LFE0IF,N04003JFE3FFE1IF0IF87FFEJ01IF,N04001JFC3FFE1IF0IF87FFCJ01IF,N04001JFC3FFE1IF0IF87FFCJ01FFE,N08I0JFC7FFC3FFE1IF0IF8J03FFE,N08I07IF87FFC3FFE1IF0IF8J03FFE,N08I07IF87FFC3FFE1IF0IF8J03FFC,R03IF0IFC3FFC3FFE1IFK07FFC,M01J01IF0IF87FFC3FFE1IFK07FFC,M01J01IF0IF87FFC3FFE1IF8J07FFE,S0FFE0IF87FFEIFE1IFCJ07IF,S07FE0IF01LF80LFE01KFD8,,:::::::::gG09E03IF3F1F801F8,g011E07E3F3F1F803F,g013E07E7E3F3F807F,g027E07E7E7E3F807F,g067E0FC7E7E3F80FE,g04FE0FC007E3F80FE,g09BE0FC007C5F817E,Y0193E1F800FC5F807C,Y0123E1F800FC9F807C,Y0263E1F800FC1F80FC,Y0243E3F001F81F80FC,Y04C7E3F1F1F91F80F8,Y0CFFE3F3F1F91F81F8,Y0903E7E3F3F00FA1F8,X01303E7E3E3F20FC1F,Y0203E7FFE3F20FC1F,Y04,Y0C,,:::::::::::::::::::::::::::::::::::::::::::::::^FS
^FWN

^XZ
`;

    Print_Service.print(printer, zpl);
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
            <MenuItem
              value={device}
              key={indx}
              style={{ color: "black" }} // Establece el color del texto en negro
            >
              {device.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className={classes.root}>
        <Button
          onClick={handlePrintZPLLabel}
          className="w-64 h-12 rounded text-base flex justify-center hover:bg-green-500"
          variant="contained"
          disabled={!printer}
        >
          Imprimir etiqueta
        </Button>
      </div>
      <div className={classes.root}></div>
    </>
  );
}