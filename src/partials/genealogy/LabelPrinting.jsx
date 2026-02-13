import { forwardRef, useEffect, useState } from "react";
import BarcodeGeneratorFunction from "./BarcodeGenerator";

const LabelPrinting = forwardRef((props, ref) => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const options = { year: 'numeric', month: 'long', day: '2-digit' };
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', options);

    // Formatear la fecha como "28/OCT/2023" sin la coma
    const parts = formattedDate.split(' ');
    const day = parts[1].replace(',', ''); // Elimina la coma
    const month = parts[0].toUpperCase().slice(0, 3);
    const year = parts[2];

    const formattedDateFinal = `${day}/${month}/${year}`;

    setCurrentDate(formattedDateFinal);
  }, []);
  
  const { qrValue, metadata } = props;
  console.log(metadata);

  const numeroMaterial = qrValue.slice(0, 9);
  const numeroSerie = qrValue.slice(9);
  
  return (
    <div ref={ref}>
      <div ref={ref} className="page">
        <table className="container-table">
          <tr className="container-row">
            <td className="row1">
              <span>Embraco</span>
            </td>
            <td className="row2">
              <span className="title">MODELO - MODEL</span>
              <span className="content">
                {Array.isArray(metadata) &&
                  metadata.find((obj) => obj.ID_CARACTMATERIAL === 1)
                    ?.DE_VALORCARACTMAT}
              </span>
            </td>
          </tr>
          <tr className="container-row">
            <td className="row3">
              <span className="title">CODIGO - EMBRACO PART NUMBER</span>
              <span className="content">
              {Array.isArray(metadata) && metadata.length > 0 ?
                  metadata[0].ID_MATERIAL : ""}
              </span>
            </td>
            <td className="row4">
              <div className="title">
                VOLTAJE/FRECUENCIA - VOLTAGE/FREQUENCY
              </div>
              <span className="content">
                {Array.isArray(metadata) &&
                  metadata.find((obj) => obj.ID_CARACTMATERIAL === 181)
                    ?.DE_VALORCARACTMAT}
              </span>
            </td>
          </tr>
          <tr className="container-row">
            <td className="row5">
              <div className="title">
                <div className="container-info">
                  <span>POTENCIA</span>
                  <span>POWER (HP)</span>
                </div>
                <div className="content">
                  <span>
                    {Array.isArray(metadata) &&
                      metadata.find((obj) => obj.ID_CARACTMATERIAL === 119)
                        ?.DE_VALORCARACTMAT}
                  </span>
                </div>
              </div>
            </td>
            <td className="row6">
              <div className="title">CAPACIDAD - CAPACITY</div>
              <div className="content-details">
                <h6 className="content">
                  <div className="information">
                    <span>50Hz LBP</span>
                  </div>
                </h6>
                <h6 className="content">
                  <div className="information">
                    <span>50Hz HBP</span>
                  </div>
                </h6>
                <h6 className="content">
                  <div className="information">
                    <span>60Hz LBP</span>
                    <span className="details">
                    {Array.isArray(metadata) &&
                  metadata.find((obj) => obj.ID_CARACTMATERIAL === 115)
                    ?.DE_VALORCARACTMAT}
                    </span>
                  </div>
                </h6>
                <h6 className="content">
                  <div className="information">
                    <span>60Hz HBP</span>
                    <span className="details"></span>
                  </div>
                </h6>
              </div>
            </td>
          </tr>
        </table>
        <table className="container-table">
          <tr className="container-row">
            <td className="row7">
              <div className="title" id="title-corrent">
                <div className="container-info">
                  <span>REFRIGERANTE</span>
                  <span>REFRIGERANT</span>
                </div>
                <div className="content">
                  <span>
                    {Array.isArray(metadata) &&
                      metadata.find((obj) => obj.ID_CARACTMATERIAL === 3)
                        ?.DE_VALORCARACTMAT}
                  </span>
                </div>
              </div>
            </td>
            <td className="row8">
              <div className="title" id="title-corrent">
                CORRIENTE - CURRENT (LRA)
              </div>
              <span className="content">
                {Array.isArray(metadata) &&
                  metadata.find((obj) => obj.ID_CARACTMATERIAL === 4)
                    ?.DE_VALORCARACTMAT}
              </span>
            </td>
            <td className="row7">
              <div className="title" id="title-enfriador">
                <div className="container-info">
                  <span>ENFRIADOR ACEITE</span>
                  <span>OIL COOLER</span>
                </div>
                <div className="content">
                  <span>
                    {Array.isArray(metadata) &&
                      metadata.find((obj) => obj.ID_CARACTMATERIAL === 120)
                        ?.DE_VALORCARACTMAT}
                  </span>
                </div>
              </div>
            </td>
            <td className="row7">
              <div className="title" id="title-phases">
                <div className="container-info">
                  <span>FASES</span>
                  <span>PHASES</span>
                </div>
                <div className="content">
                  <span>
                    {Array.isArray(metadata) &&
                      metadata.find((obj) => obj.ID_CARACTMATERIAL === 118)
                        ?.DE_VALORCARACTMAT}
                  </span>
                </div>
              </div>
            </td>
          </tr>
        </table>
        <table className="container-table">
          <tr className="container-row">
            <td className="row9">
              <div className="container-serial-code">
                <div className="bar-code">
                  {" "}
                  <BarcodeGeneratorFunction value={qrValue} />
                </div>
                <div className="serial">
                  <span> {qrValue.slice(0, 9)}</span>
                  {/* Pendiente numeroSerie */}
                  <span>{qrValue.slice(qrValue.length - 8)}</span>
                </div>
                <span className="made-country">
                  HECHO <br />
                  MANUFACTURING <br />
                  APODACA-NL MADE IN MEXICO
                </span>
              </div>
              <div>
                <p className="date">{currentDate}</p>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  );
});

export default LabelPrinting;
