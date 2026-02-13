import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";


import { InfoCircle, Verify } from "iconsax-react";
import ModalBlank from "../../components/ModalBlank";
import {
  reprocessPallet,
  selectPallet
} from "../../store/slice/palletsSlice";

function LogsItem(props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const dispatch = useDispatch();
  const [dangerModalOpen, setDangerModalOpen] = useState(false);
  const palletSelected = useSelector(selectPallet);
  const [isLoading, setIsloading] = useState(false);

  const handleDispatch = async () => {
    setIsloading(true);
    try {
      await dispatch(reprocessPallet(props.identifier));
    } catch (error) {
      // Maneja los errores aquí si es necesario
      console.log("Error al reprocesar el lote: " + error);
    }
    setIsloading(false);
  };

  const handleReprocess = () => {
    // Llama a la acción para eliminar el componente por su id
    setIsloading(true);
    handleDispatch();
    setTimeout(() => {
      props.fetchPallets('&workstation=MX8ST010');
    }, 5000);
   
    //dispatch(unmountComponent(props));
  };

  // Función para formatear la fecha y hora
  function formatDateTime(datetime) {
    const dateObj = new Date(datetime);

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const seconds = String(dateObj.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  return (
    <>
      <tr>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
          <div className="flex items-center">
            <button
              className={`text-slate-400 hover:text-slate-500 transform ${detailsOpen && 'rotate-180'}`}
              aria-expanded={detailsOpen}
              onClick={() => { setDetailsOpen(!detailsOpen); console.log(props.mounted_components)}}
              aria-controls={`details-${props.id}`}
            >
              <span className="sr-only">Menu</span>
              <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32">
                <path d="M16 20l-5.4-5.4 1.4-1.4 4 4 4-4 1.4 1.4z" />
              </svg>
            </button>
          </div>
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
          <div className="flex items-center">
            
              <a className="font-medium">
                {props.id}
              </a>
   
          </div>
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
          <div className="text-center text-md font-medium">
            {props.identifier}
          </div>
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
          <div className="text-center text-md font-medium">
            {props.product}
          </div>
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
          <div className="text-center text-md font-medium">
            {props.order}
          </div>
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-6 whitespace-nowrap">
          <div className="text-center text-md font-medium">
            {props.quantity}
          </div>
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-6 whitespace-nowrap">
          <div className="text-center text-md font-medium">
            {props.mounted_components_count}
          </div>
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
          <div className="text-center text-md font-medium">
            {formatDateTime(props.datetimeCreated)}
          </div>
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
          <div className="text-center font-medium">
            {props.sendToSAP === true && props.sapSuccess ? (
              <div className="flex">
                <Verify className="mr-2" color="#009B4A" size={20} />
                <p className="text-primary">{props.sapStatus}</p>
              </div>
            ) : (
              <div className="flex text-center">
                <InfoCircle className="mr-2" color="gray" size={20} />
                <p className="text-gray">{props.sapStatus}</p>
              </div>
            )}
          </div>
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
          {/* Menu button */}
          {props.sapSuccess ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="text-center font-semibold text-gray border btn border-slate-300 pointer-events-none w-full"
            >
              Reprocesar
            </button>
          ) : isLoading ? (
            <button
              className={
                "btn bg-primary text-white disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-none"
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
              aria-controls="danger-modal"
              disabled={props.mounted_components_count < props.quantity}
              onClick={(e) => {
                e.stopPropagation();
                setDangerModalOpen(true);
              }}
              className={`text-center font-semibold w-full ${
                props.mounted_components_count < props.quantity
                  ? "text-slate-400 cursor-not-allowed opacity-50"
                  : "text-primary cursor-pointer"
              }`}
            >
              Reprocesar
            </button>
          )}
        </td>
      </tr>
      {/*
      Example of content revealing when clicking the button on the right side:
      Note that you must set a "colSpan" attribute on the <td> element,
      and it should match the number of columns in your table
      */}
      <tr id={`details-${props.id}`} role="region" className={`${!detailsOpen && 'hidden'}`}>
  <td colSpan="10" className="px-2 first:pl-5 last:pr-5 py-3">
    <div className="flex items-center bg-slate-50 p-3 -mt-3">
      <table className="table-auto w-full" >
      <thead className="text-xs font-normal uppercase text-gray bg-slate-50 border-t border-b border-slate-200">
        <tr>
          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap"><div className="font-medium">No.</div></th>
          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap"><div className="font-medium">Condensador (Serial)</div></th>
          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap"><div className="font-medium">Condensador (Material)</div></th>
          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap"><div className="font-medium">Compresor (Serial)</div></th>
          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap"><div className="font-medium">Compresor (Material)</div></th>
          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap"><div className="font-medium">Enviado a SAP</div></th>
          <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap"><div className="font-medium">SAP Status</div></th>
        </tr>
      </thead>
      <tbody>
        {props.mounted_components.map((component, index) => {
           const rowNumber = index + 1;
          return (
          <tr key={component.id}>
            <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px font-medium text-gray">{rowNumber}</td>
            <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px font-medium text-gray">{component.condenser_unit_serial}</td>
            <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px font-medium text-gray">{component.condenser_material_code}</td>
            <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px font-medium text-gray">{component.compressor_unit_serial}</td>
            <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px font-medium text-gray">{component.compressor_material_code}</td>
            <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px font-medium text-gray">{component.send_to_sap ? 'Si' : 'No'}</td>
            <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px font-medium text-gray">{component.sap_status}</td>
          </tr>
        )})}
      </tbody>
    </table>
    </div>
    {/* Renderizar los componentes montados en una tabla */}
    
  </td>
</tr>
      {/* Danger Modal */}
      <div className="">
        {/* Start */}

        <ModalBlank
          id="danger-modal"
          modalOpen={dangerModalOpen}
          setModalOpen={setDangerModalOpen}
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
            <div>
              {/* Modal header */}
              <div className="mb-2">
                <div className="text-lg font-semibold text-slate-800">
                  Reprocesar: {props.identifier}
                </div>
              </div>
              {/* Modal content */}
              <div className="text-sm mb-10">
                <div className="space-y-2">
                  <p className="text-black">
                    ¿Estás seguro que deseas reprocesar el lote:{" "}
                    {props.identifier}? Esta acción enviará el lote de nuevo al sistema SAP.
                  </p>
                </div>
              </div>
              {/* Modal footer */}
              <div className="flex flex-wrap justify-end space-x-2">
                <button
                  className="btn-sm border-slate-200 hover:border-slate-300 text-slate-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDangerModalOpen(false);
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="btn-sm bg-primary hover:bg-primary-500 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDangerModalOpen(false);
                    handleReprocess();
                  }}
                >
                  Si, reprocesar
                </button>
              </div>
            </div>
          </div>
        </ModalBlank>
        {/* End */}
      </div>
    </>
  );
}

export default LogsItem;
