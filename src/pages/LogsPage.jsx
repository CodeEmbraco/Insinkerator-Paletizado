import icons from "../assets/icons/icons";
import Layout from "../components/Layout";
import { useEffect } from "react";

import LogsView from "./LogsView";

function LogsPage() {
  // useEffect(() => {
  //   setTimeout(() => {
  //     localStorage.removeItem("b-gantt-trial-start");
  //     window.location.reload();
  //   }, 60000);
   
  // }, []);

  return (
    <Layout
      icon={icons.dashboardIcon}
      nameRoute={"Logs"}
      nameSubRoute={"Logs"}
    >
        <LogsView/>
    </Layout>
  );
}

export default LogsPage;