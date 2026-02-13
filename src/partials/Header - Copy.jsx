import { useEffect, useState } from "react";
import icons from "../assets/icons/icons";
// import Help from "../components/DropdownHelp";
import UserMenu from "../components/DropdownProfile";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Add, Barcode, BoxSearch, Grid2, Grid8, Note, Notepad2 } from "iconsax-react";

import { selectOpenOrdersList, getOpenOrdersList } from "../store/slice/ordersSlice";

function Header({
  sidebarOpen,
  setSidebarOpen,
  icon,
  nameRoute,
  nameSubRoute,
  basicModalOpen,
  setBasicModalOpen,
}) {
  const dispatch = useDispatch();
  const rol = sessionStorage.getItem("rol");
  const openOrdersList = useSelector(selectOpenOrdersList);

 const handleClick = (e) => {
    console.log("Open orders list");
    e.stopPropagation();
    dispatch(getOpenOrdersList());
    if (openOrdersList.length > 0) {
      setBasicModalOpen(true);
    }
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
                <button onClick={handleClick}>
                  <a
                    href="#"
                    className={`flex bg-black hover:text-hoverTextSidebar transition duration-500 easy-in-out text-white font-semibold lg:mr-7 ${
                      openOrdersList.length === 0
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
                  </a>
                </button>
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
    </>
  );
}

export default Header;
