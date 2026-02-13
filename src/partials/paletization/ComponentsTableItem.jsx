import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { Clock, Verify } from "iconsax-react";
import ModalBlank from "../../components/ModalBlank";
import {
  selectPallet,
  unmountComponentAPI,
} from "../../store/slice/palletsSlice";

function ComponentsItem(props) {
  const dispatch = useDispatch();
  const [dangerModalOpen, setDangerModalOpen] = useState(false);
  const palletSelected = useSelector(selectPallet);

  const handleUnmount = () => {
    // Llama a la acción para eliminar el componente por su id
    dispatch(unmountComponentAPI(palletSelected.identifier, props));
    //dispatch(unmountComponent(props));
  };

  return (
    <>
      <tr>
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
          <div className="flex items-center">
            <button onClick={() => {}}>
              <a className="font-medium text-primary hover:text-primary ">
                {props.rowNumber}
              </a>
            </button>
          </div>
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
          <div className="text-left text-md font-medium text-gray">
            {props.condMaterialCode}
          </div>
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
          <div className="text-left text-md font-medium text-gray">
            {props.condUnitSerial}
          </div>
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-6 whitespace-nowrap">
          <div className="text-left text-md font-medium text-gray">
            {props.compMaterialCode}
          </div>
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
          <div className="text-left text-md font-medium text-gray">
            {props.compUnitSerial}
          </div>
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
          <div className="text-center font-medium text-gray">
            {props.sendToSAP === true ? (
              <div className="flex">
                <Verify className="mr-2" color="#009B4A" size={20} />
                <p className="text-primary">{props.sapStatus}</p>
              </div>
            ) : (
              <div className="flex text-center">
                <Clock className="mr-2" color="gray" size={20} /> Pendiente
              </div>
            )}
          </div>
        </td>
        <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
          {/* Menu button */}
          {props.sendToSAP ? null : (
            <button
              aria-controls="danger-modal"
              onClick={(e) => {
                e.stopPropagation();
                setDangerModalOpen(true);
              }}
              className="text-center font-semibold text-red-500"
            >
              Desmontar
            </button>
          )}
        </td>
      </tr>
      {/* Danger Modal */}
      <div className="m-1.5">
        {/* Start */}

        <ModalBlank
          id="danger-modal"
          modalOpen={dangerModalOpen}
          setModalOpen={setDangerModalOpen}
        >
          <div className="p-5 flex space-x-4">
            {/* Icon */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-rose-100">
              <svg
                className="w-4 h-4 shrink-0 fill-current text-rose-500"
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
                  Desmontar: {props.condUnitSerial}
                </div>
              </div>
              {/* Modal content */}
              <div className="text-sm mb-10">
                <div className="space-y-2">
                  <p>
                    ¿Estás seguro que deseas desmontar el componente:{" "}
                    {props.condUnitSerial}? Esta acción no se puede deshacer y
                    tendrías que escanear el componente de nuevo para montarlo
                    en este u otro lote.
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
                  className="btn-sm bg-rose-500 hover:bg-rose-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDangerModalOpen(false);
                    handleUnmount();
                  }}
                >
                  Si, desmontar
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

export default ComponentsItem;
