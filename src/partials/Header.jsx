import { useEffect, useRef, useState } from "react";
import icons from "../assets/icons/icons";
// import Help from "../components/DropdownHelp";
import UserMenu from "../components/DropdownProfile";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import {
  Add,
  Barcode,
  BoxSearch,
  Grid2,
  Grid8,
  Note,
  Notepad2,
  Play,
} from "iconsax-react";

import { selectOpenOrdersList, selectLoading, getOpenOrdersList } from "../store/slice/ordersSlice";
import {
  isMonthEndLocked,
  activateMonthEndLock,
  deactivateMonthEndLock,
} from "../utils/monthEndLock";
import ModalBlank from "../components/ModalBlank";

// Contraseña de administrador requerida para reactivar la consulta a SAP
// tras un cierre de mes (misma que el candado de Reprocesar en Logs).
const MONTH_END_PASSWORD = "Nidec2026";

function Header({
  sidebarOpen,
  setSidebarOpen,
  icon,
  nameRoute,
  nameSubRoute,
  basicModalOpen,
  setBasicModalOpen,
  onOpenContinuePallet,
}) {
  const dispatch = useDispatch();
  const rol = sessionStorage.getItem("rol");
  const openOrdersList = useSelector(selectOpenOrdersList);
  const ordersLoading = useSelector(selectLoading);

  const location = useLocation();

  const [monthEndActive, setMonthEndActive] = useState(() => isMonthEndLocked());
  const [monthEndPasswordModalOpen, setMonthEndPasswordModalOpen] = useState(false);
  const [monthEndPasswordInput, setMonthEndPasswordInput] = useState("");
  const [monthEndPasswordError, setMonthEndPasswordError] = useState(false);
  // Se activa solo al desactivar el cierre de mes, para deshabilitar
  // "Órdenes" hasta que llegue el primer listado fresco de SAP — no en cada
  // click normal del botón (ese ya refresca en cada apertura por su cuenta).
  const [awaitingReactivation, setAwaitingReactivation] = useState(false);
  // El listado ya quedó fresco justo después de una consulta (al reactivar
  // el cierre de mes, o al cargar la página por primera vez): el siguiente
  // click en "Órdenes" no necesita volver a consultarlo, solo abrir el modal.
  const [skipNextOrdersFetch, setSkipNextOrdersFetch] = useState(false);
  const wasOrdersLoadingRef = useRef(false);

  useEffect(() => {
    if (awaitingReactivation && !ordersLoading) {
      setAwaitingReactivation(false);
    }
    if (wasOrdersLoadingRef.current && !ordersLoading) {
      setSkipNextOrdersFetch(true);
    }
    wasOrdersLoadingRef.current = ordersLoading;
  }, [ordersLoading, awaitingReactivation]);

  const handleClick = (e) => {
    console.log("Open orders list");
    e.stopPropagation();
    if (awaitingReactivation) return;
    if (skipNextOrdersFetch) {
      setSkipNextOrdersFetch(false);
    } else {
      dispatch(getOpenOrdersList());
    }
    if (openOrdersList.length > 0) {
      setBasicModalOpen(true);
    }
  };

  const handleMonthEndClick = (e) => {
    e.stopPropagation();
    if (!monthEndActive && (!openOrdersList || openOrdersList.length === 0)) {
      toast.error(
        "No hay órdenes cargadas para congelar. Abre el listado de órdenes primero."
      );
      return;
    }
    setMonthEndPasswordInput("");
    setMonthEndPasswordError(false);
    setMonthEndPasswordModalOpen(true);
  };

  const handleValidateMonthEndPassword = () => {
    if (monthEndPasswordInput !== MONTH_END_PASSWORD) {
      setMonthEndPasswordError(true);
      return;
    }
    if (monthEndActive) {
      deactivateMonthEndLock();
      setMonthEndActive(false);
      setAwaitingReactivation(true);
      dispatch(getOpenOrdersList());
      toast.success("Cierre de mes desactivado: consultando SAP en vivo.");
    } else {
      activateMonthEndLock(openOrdersList);
      setMonthEndActive(true);
      toast.success(
        "Cierre de mes activado: se usará el listado de órdenes actual hasta reactivar."
      );
    }
    setMonthEndPasswordModalOpen(false);
    setMonthEndPasswordInput("");
    setMonthEndPasswordError(false);
  };

  useEffect(() => {}, []);

  return (
    <>
    {openOrdersList.length === 0 && (
       
       <div className="infinite-progress-bar">
       <div className="bar"></div>
     </div>

      )}
      <div className="w-screen relative sticky top-0 z-50">
        <nav className="bg-black py-5">
          <div className="bg-black container mx-auto flex">
            <img
              src={icons.nidecAllForDreams}
              alt="Logo"
              className="w-24 bg-black mr-8"
            />
            <div className="bg-black flex flex-grow justify-between">
              <div className="flex bg-black my-auto">
                <Link
                  to="/paletization"
                  className={`flex bg-black hover:text-hoverTextSidebar transition duration-500 easy-in-out ${location.pathname === '/paletization' ? 'text-hoverTextSidebar' : 'text-white'} font-semibold lg:mr-7`}
                >
                  <Grid8 className="bg-black mr-2" color="#ffff" size={24} />{" "}
                  Paletización
                </Link>
                <button onClick={handleClick} disabled={awaitingReactivation}>
                  <a
                    href="#"
                    className={`flex items-center bg-black hover:text-hoverTextSidebar transition duration-500 easy-in-out text-white font-semibold lg:mr-7 ${
                      openOrdersList.length === 0 || awaitingReactivation
                        ? "pointer-events-none opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <Notepad2
                      className="bg-black mr-2"
                      color="#ffff"
                      size={24}
                    />
                    Órdenes
                    {awaitingReactivation && (
                      <svg
                        className="animate-spin bg-transparent w-4 h-4 fill-current shrink-0 ml-2 text-white"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 16a7.928 7.928 0 01-3.428-.77l.857-1.807A6.006 6.006 0 0014 8c0-3.309-2.691-6-6-6a6.006 6.006 0 00-5.422 8.572l-1.806.859A7.929 7.929 0 010 8c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
                      </svg>
                    )}
                  </a>
                </button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={monthEndActive}
                  disabled={awaitingReactivation}
                  onClick={handleMonthEndClick}
                  title={
                    awaitingReactivation
                      ? "Consultando órdenes en SAP..."
                      : monthEndActive
                      ? "Cierre de mes activo: click para reactivar consulta a SAP"
                      : "Activar cierre de mes"
                  }
                  className={`flex items-center bg-black my-auto lg:mr-7 ${
                    awaitingReactivation ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span className="text-white font-semibold mr-3">Cierre de mes</span>
                  <span
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
                      monthEndActive ? "bg-yellow-400" : "bg-slate-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                        monthEndActive ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </span>
                </button>
                {location.pathname === "/paletization" && onOpenContinuePallet && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenContinuePallet();
                    }}
                    className="flex bg-black hover:text-hoverTextSidebar transition duration-500 easy-in-out text-white font-semibold lg:mr-7"
                  >
                    <Play
                      className="bg-black mr-2"
                      color="#ffff"
                      size={24}
                    />
                    Continuar pallet
                  </button>
                )}
                <Link
                 to="/logs"
                 className={`flex bg-black hover:text-hoverTextSidebar transition duration-500 easy-in-out ${location.pathname === '/logs' ? 'text-hoverTextSidebar' : 'text-white'} font-semibold lg:mr-7`}
                >
               
                  {" "}
                  <BoxSearch className="bg-black mr-2" color="#ffff" size={24} />
                  Logs
          
                </Link>
              </div>
              <div className="bg-black my-auto">
                <UserMenu align="right" />
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Password Modal (bloqueo previo a reactivar la consulta a SAP) */}
      <ModalBlank
        id="month-end-password-modal"
        modalOpen={monthEndPasswordModalOpen}
        setModalOpen={setMonthEndPasswordModalOpen}
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
                Contraseña requerida
              </div>
            </div>
            <div className="text-sm mb-6">
              <div className="space-y-2">
                <p className="text-black">
                  {monthEndActive
                    ? "Ingresa la contraseña de administrador para desactivar el cierre de mes y reactivar la consulta a SAP."
                    : "Ingresa la contraseña de administrador para activar el cierre de mes y congelar el listado de órdenes actual."}
                </p>
              </div>
              <div className="mt-4">
                <input
                  type="password"
                  autoFocus
                  value={monthEndPasswordInput}
                  onChange={(e) => {
                    setMonthEndPasswordInput(e.target.value);
                    if (monthEndPasswordError) setMonthEndPasswordError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleValidateMonthEndPassword();
                    }
                  }}
                  className="form-input w-full h-12"
                  placeholder="Contraseña"
                />
                {monthEndPasswordError && (
                  <p className="text-sm text-red-500 mt-2">
                    Contraseña incorrecta.
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-end space-x-2">
              <button
                className="btn-sm border-slate-200 hover:border-slate-300 text-slate-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setMonthEndPasswordModalOpen(false);
                }}
              >
                Cancelar
              </button>
              <button
                className="btn-sm bg-primary hover:bg-primary-500 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleValidateMonthEndPassword();
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </ModalBlank>
    </>
  );
}

export default Header;
