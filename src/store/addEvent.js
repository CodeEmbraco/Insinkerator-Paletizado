import { addEventToGenealogyLog, addEventToPaletizationLog } from "./slice/eventsLogSlice";
import store from './store';

export function saveEvent(event, path){
    if(path === "/genealogy"){
        store.dispatch(addEventToGenealogyLog(event));
    } else {
        store.dispatch(addEventToPaletizationLog(event));
    }
}