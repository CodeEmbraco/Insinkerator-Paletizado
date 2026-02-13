import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slice/authSlice';
import openOrdersSlice from './slice/ordersSlice.js';
import orderSelectedSlice from './slice/orderSelectedSlice';
import eventsLogSlice from './slice/eventsLogSlice';
import testResultsSlice from './slice/testResultSlice';
import palletsSlice from './slice/palletsSlice';
// import usersSlice from './slice/usersSlice';
// import BaseCapabilitiesSlice from './slice/BaseCapabilitiesSlice';
// import LineRateCustomSlice from './slice/LineRateCustomSlice';
// import calendarSlice from './slice/calendarSlice';
// import planningSlice from './slice/planningSlice';
// import kpiSlice from './slice/kpiSlice';
// import systemStatusSlice from './slice/systemStatusSlice';
// import filterSlice from './slice/filterSlice';
// import ordersPlannedSlice from './slice/ordersPlannedSlice';
// import openOrdersSlice from './slice/openOrdersSlice';
// import demandPlanningOrdersSlice from './slice/DemandPlanningOrdersSlice';
// import ganttSlice from './slice/ganttSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    openOrders: openOrdersSlice,
    orderSelected: orderSelectedSlice,
    eventsLog: eventsLogSlice,
    testResults: testResultsSlice,
    pallets: palletsSlice,
    // users: usersSlice,
    // group: BaseCapabilitiesSlice,
    // calendar: calendarSlice,
    // planning: planningSlice,
    // users: usersSlice,
    // group: BaseCapabilitiesSlice,
    // calendar: calendarSlice,
    // planning: planningSlice,
    // kpi: kpiSlice,
    // systemStatus: systemStatusSlice,
    // filter: filterSlice,
    // orders: ordersPlannedSlice,
    // openOrders: openOrdersSlice,
    // demandPlanningOrders: demandPlanningOrdersSlice,
    // LineRateCustom: LineRateCustomSlice,
    // gantt: ganttSlice,
  },
});

export default store;