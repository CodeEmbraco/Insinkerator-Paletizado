import json
import requests
from django.shortcuts import render
from typing import Dict, Any, List

from django.db.models import Q

# Create your views here.
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from .models import Pallet, MountedComponent
from .serializers import PalletSerializer, MountedComponentSerializer, MountedComponentCreateSerializer
from .sap_client import get_sap_client
from xml.etree import ElementTree as ET

class PalletListCreateView(APIView):
    def get(self, request):
        query_params = request.GET
        # Acceder a un query param específico
        workstation = request.GET.get('workstation', None)
        if workstation:
            # Filtrar los pallets por estación de trabajo y ordenarlos por datetime_created en orden descendente
            pallets = Pallet.objects.filter(workstation=workstation).order_by('-datetime_created')

            # Obtener el primer pallet de la lista (el más reciente)
            ultimo_pallet = pallets.first()
            serializer = PalletSerializer(ultimo_pallet)
            return Response(serializer.data)
        else:
            return Response({"error": f"You need to specify the workstation query param"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        order = request.data.get('order')
        workstation = request.data.get('workstation')
        identifier = request.data.get("identifier")
        quantity = request.data.get("quantity")
        product = request.data.get("product")

        try:
            pallet = Pallet.objects.get(identifier=identifier)
            # Actualizar datos si vienen en el payload
            if pallet.order is None and order is not None:
                pallet.order = order
            if pallet.workstation is None and workstation is not None:
                pallet.workstation = workstation
            if pallet.product is None and product is not None:
                pallet.product = product
            if pallet.quantity is None and quantity is not None:
                pallet.quantity = quantity
            pallet.save()

            serializer = PalletSerializer(pallet)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Pallet.DoesNotExist:
            pallet = Pallet.objects.create(
                identifier=identifier,
                order=order,
                workstation=workstation,
                quantity=quantity if quantity is not None else 32,
                product=product
            )
            serializer = PalletSerializer(pallet)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
    def put(self, request, pallet_id):
        try:
            pallet = Pallet.objects.get(identifier=pallet_id)
            if pallet.is_closed:
                pallet.open_pallet()
            else:
                pallet.close_pallet()
            return Response({"message": "Pallet status closed successfully."})
        except Pallet.DoesNotExist:
            return Response({"error": "Pallet not found."}, status=status.HTTP_404_NOT_FOUND)

class MountedComponentListByPalletView(APIView):
    def get(self, request, pallet_id):
        try:
            pallet = Pallet.objects.get(identifier=pallet_id)
            components = MountedComponent.objects.filter(pallet=pallet)
            serializer = MountedComponentSerializer(components, many=True)
            return Response(serializer.data)
        except Pallet.DoesNotExist:
            return Response({"error": "Pallet not found."}, status=status.HTTP_404_NOT_FOUND)

class MountedComponentAssociateToPalletView(APIView):
    def post(self, request, pallet_id):
        try:
            pallet, created = Pallet.objects.get_or_create(identifier=pallet_id)
            data = request.data
            data['pallet_id'] = pallet.identifier  # Asigna el identificador del pallet a 'pallet_id'
            try:
                mounted_component = MountedComponent.objects.get(
                    condenser_unit_serial=data['condenser_unit_serial']
                )
                if mounted_component:
                    return Response(
                        {"error": "Component already mounted"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except MountedComponent.DoesNotExist:
                pass

            serializer = MountedComponentCreateSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                pallet.quantity += 1
                pallet.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Aquí ya no tiene sentido capturar Pallet.DoesNotExist porque usamos get_or_create
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MountedComponentDismountFromPalletView(APIView):
    def delete(self, request, pallet_id, component_id):
        try:
            pallet = Pallet.objects.get(identifier=pallet_id)
            try:
                component = MountedComponent.objects.get(id=component_id, pallet=pallet)
                component.delete()
                if pallet.quantity > 0:
                    pallet.quantity -= 1
                    pallet.save()
                return Response({"msg": "MountedComponent dismounted"}, status=status.HTTP_204_NO_CONTENT)
            except MountedComponent.DoesNotExist:
                return Response({"error": "MountedComponent not found in the pallet."}, status=status.HTTP_404_NOT_FOUND)
        except Pallet.DoesNotExist:
            return Response({"error": "Pallet not found."}, status=status.HTTP_404_NOT_FOUND)


class PalletLogs(APIView):
    def get(self, request):
        workstation = request.GET.get('workstation', None)
        sap_success = request.GET.get('sap_success', None)
        
        # Crear un objeto Q para almacenar las condiciones de filtro
        filters = Q()
        
        if workstation:
            filters &= Q(workstation=workstation)
        
        # Aplicar filtro basado en sap_success si está presente
        if sap_success is not None:
            if sap_success.lower() == 'true':
                filters &= Q(sap_success=True)
            elif sap_success.lower() == 'false':
                filters &= Q(sap_success=False)
        
        # Aplicar los filtros y ordenar por fecha de creación
        pallets = Pallet.objects.filter(filters).order_by('-datetime_created')

        # Obtener el conteo y los detalles de los componentes montados para cada paleta
        pallet_data = []
        for pallet in pallets:
            pallet_dict = {
                'pallet': PalletSerializer(pallet).data,
                'mounted_components_count': pallet.mountedcomponent_set.count(),
                'mounted_components': MountedComponentSerializer(pallet.mountedcomponent_set.all(), many=True).data
            }
            pallet_data.append(pallet_dict)

        paginator = PageNumberPagination()
        paginated_pallets = paginator.paginate_queryset(pallet_data, request)
        
        total_count = len(pallet_data)
        
        return paginator.get_paginated_response({
            'total_count': total_count,
            'pallets': paginated_pallets
        })
    
class NotifiyToSAPView(APIView):

    def convert_json_to_xml(self, json_data):
        envelope = ET.Element("soapenv:Envelope",  attrib={"xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/", "xmlns:urn": "urn:sap-com:document:sap:soap:functions:mc-style"})
        body = ET.Element("soapenv:Body")
        header = ET.Element("soapenv:Header")
        zppfm_production_notification = ET.Element("urn:ZppfmProductionNotification")
        
        # Construct XML elements based on JSON data
        elements = {
            "IArbpl": json_data.get("IArbpl", ""),
            "IAufnr": json_data.get("IAufnr", ""),
            "ICharg": json_data.get("ICharg", ""),
            "IComplemento": json_data.get("IComplemento", ""),
            "IDataProd": json_data.get("IDataProd", ""),
            "IFase": json_data.get("IFase", ""),
            "IHoraProd": json_data.get("IHoraProd", ""),
            "IMatnrDestino": json_data.get("IMatnrDestino", ""),
            "IMatnrOrigem": json_data.get("IMatnrOrigem", ""),
            "INumin": json_data.get("INumin", ""),
            "IQuantProd": str(json_data.get("IQuantProd", 0)),
        }
        
        for key, value in elements.items():
            element = ET.Element(key)
            element.text = value
            zppfm_production_notification.append(element)
        
        it_json_inst = ET.Element("ItJsonInst")
        it_json_inst.text = str(json_data.get("ItJsonInst", ""))
        
        zppfm_production_notification.append(it_json_inst)
        
        body.append(zppfm_production_notification)

        envelope.append(header)
        
        envelope.append(body)
    
        xml_string = ET.tostring(envelope, encoding='utf-8').decode()
        return xml_string
    
    def post(self, request):
        sap_client = get_sap_client()
        json_data = request.data
        # Convert the JSON data to an XML request
        xml_data = self.convert_json_to_xml(json_data)
        print(type(xml_data))
        palletId = json_data.get("ICharg", "")
        try:
            pallet = Pallet.objects.get(identifier = palletId)
        except Pallet.DoesNotExist:
            return Response({"error": "Pallet not found."}, status=status.HTTP_404_NOT_FOUND)
        # Build the SOAP request using the data from the JSON
        components_list = json_data.get("ItJsonInst", "")
        mat_destino = json_data.get("IMatnrDestino", "")
        if pallet.send_to_sap and pallet.sap_success:
            complemento = "X"
        else:
            complemento = ""
        try:
            #import pdb; pdb.set_trace()
            sap_response = sap_client.service.ZppfmProductionNotification(
            json_data.get("IArbpl", ""), json_data.get("IAufnr", ""), 
            json_data.get("ICharg", ""),
            complemento, json_data.get("IDataProd", ""), json_data.get("IFase", ""), 
            json_data.get("IHoraProd", ""), mat_destino, json_data.get("IMatnrOrig"),  
            json_data.get("INumin", ""), str(len(components_list)),
            json.dumps(components_list))
            fase = sap_response.EFase
            message = sap_response.EMessage
            if message == "Process Notification executed successfully":
                pallet.send_to_sap = True
                pallet.sap_success = True
                pallet.sap_status = f"Lote {palletId} sincronizado con éxito en SAP."
                for component_data in components_list:
                    if json_data.get("IArbpl") == "MX8ST010":
                        full_serial = component_data["full_serial"]
                        mounted_component = MountedComponent.objects.get(pallet=pallet, condenser_unit_serial=full_serial)
                        mounted_component.send_to_sap = True
                        mounted_component.sap_status = "Procesado"
                        mounted_component.save()
                    else:
                        condenser_serial = mat_destino + component_data["sernr"]
                        compressor_serial = component_data["matfi"][:9] + component_data["serfi"]
                        print(condenser_serial)
                        print(compressor_serial)
                        # Si hay MountedComponent asociados al Pallet, también los actualizamos
                        mounted_component = MountedComponent.objects.get(
                            pallet=pallet, condenser_unit_serial=condenser_serial, compressor_unit_serial=compressor_serial
                        )
                        mounted_component.send_to_sap = True
                        mounted_component.sap_status = "Procesado"
                        mounted_component.save()
            else:
                pallet.sap_success = False
                pallet.sap_status = f"Error en sincronización de lote {palletId}. Detalles: {message}"
                for component_data in components_list:
                    if json_data.get("IArbpl") == "MX8ST010":
                        full_serial = component_data["full_serial"]
                        mounted_component = MountedComponent.objects.get(pallet=pallet, condenser_unit_serial=full_serial)
                        mounted_component.send_to_sap = False
                        mounted_component.sap_status = "Error al procesar"
                        mounted_component.save()
                    else:
                        condenser_serial = mat_destino + component_data["sernr"]
                        compressor_serial = component_data["matfi"][:9] + component_data["serfi"]
                        # Si hay MountedComponent asociados al Pallet, también los actualizamos
                        mounted_component = MountedComponent.objects.get(
                            pallet=pallet, condenser_unit_serial=condenser_serial, compressor_unit_serial=compressor_serial
                        )
                        mounted_component.send_to_sap = False
                        mounted_component.sap_status = "Error al procesar"
                        mounted_component.save()
            
            pallet.fase = fase
            pallet.save()
            print(fase)
            print(message)
            
            return Response(sap_response)
        except Exception as e:
            print(e)
            return Response({"error": f"Error: {e}", "components": components_list}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReProcessSAPView_old_version(APIView):
    def post(self, request):
        sap_client = get_sap_client()
        pallet_id = request.data.get('pallet', None)
        if not pallet_id:
            return Response({"error": "Pallet identifier is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            pallet = Pallet.objects.get(identifier = pallet_id)
            """
             IArbpl: "MXCDU01",
                IAufnr: orderSelected.aufnr,
                IMatnrDestino: orderSelected.matnr,
                ICharg: pallet,
                IDataProd: currentDate,
                IHoraProd: currentTime,
                IQuantProd: n_components,
                INumin: "G",
                ItJsonInst: [
                    {},
                    {}
                ]
            """
            line_id = "MXCDU01"
            datetime_created = pallet.datetime_created
            interface = "F"
            complemento = "X"
            date_prod = datetime_created.strftime('%Y-%m-%d')

            # Obtener la hora en formato HH:MM:SS
            time_prod = datetime_created.strftime('%H:%M:%S')

            fase = "6"
            mounted_components = MountedComponent.objects.filter(pallet=pallet).exclude(sap_status="Procesado")

            components_list = []

            for component in mounted_components:
                components_list.append(
                    {
                        "sernr": component.condenser_unit_serial,
                        "matnr": component.condenser_material_code,
                        "serfi": component.compressor_unit_serial,
                        "matfi": component.compressor_material_code,
                        "tipo": "S"
                    }
                )

            json_inst = json.loads(components_list)
            try:
                #import pdb; pdb.set_trace()
                sap_response = sap_client.service.ZppfmProductionNotification(
                line_id, pallet.order,
                pallet.identifier,
                complemento, date_prod, fase, 
                time_prod, pallet.product, pallet.product,  
                interface, str(len(components_list)),
                json_inst)
                fase = sap_response.EFase
                message = sap_response.EMessage
                if message == "Process Notification executed successfully":
                    pallet.send_to_sap = True
                    pallet.sap_success = True
                    pallet.sap_status = f"Lote {pallet.identifier} sincronizado con éxito en SAP."
                    error = False
                else:
                    pallet.sap_success = False
                    pallet.sap_status = f"Error en sincronización de lote {pallet.identifier}. Detalles: {message}"
                    error = True
                pallet.fase = fase
                pallet.save()
                print(fase)
                print(message)
                return Response(sap_response)
            except Exception as e:
                print(e)
                return Response({"error": f"Error: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Pallet.DoesNotExist:
            return Response({"error": "Pallet not found."}, status=status.HTTP_404_NOT_FOUND)

class ReProcessSAPView(APIView):
 def post(self, request):
        sap_client = get_sap_client()
        pallet_id = request.data.get('pallet', None)
        if not pallet_id:
            return Response({"error": "Pallet identifier is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            pallet = Pallet.objects.get(identifier = pallet_id)
            """
             IArbpl: "MXSG002",
                IAufnr: orderSelected.aufnr,
                IMatnrDestino: orderSelected.matnr,
                ICharg: pallet,
                IDataProd: currentDate,
                IHoraProd: currentTime,
                IQuantProd: n_components,
                INumin: "6",
                ItJsonInst: null
            """
            line_id = pallet.workstation
            datetime_created = pallet.datetime_created
            interface = "6"
            complemento = " "
            date_prod = datetime_created.strftime('%Y-%m-%d')

            # Obtener la hora en formato HH:MM:SS
            time_prod = datetime_created.strftime('%H:%M:%S')

            fase = ""
            json_inst = ""
            try:
                #import pdb; pdb.set_trace()
                sap_response = sap_client.service.ZppfmProductionNotification(
                line_id, pallet.order,
                pallet.identifier,
                complemento, date_prod, fase, 
                time_prod, pallet.product, pallet.product,  
                interface, str(pallet.quantity),
                json_inst)
                fase = sap_response.EFase
                message = sap_response.EMessage
                if message == "Process Notification executed successfully":
                    pallet.send_to_sap = True
                    pallet.sap_success = True
                    pallet.sap_status = f"Lote {pallet.identifier} sincronizado con éxito en SAP."
                    error = False
                else:
                    pallet.sap_success = False
                    pallet.sap_status = f"Error en sincronización de lote {pallet.identifier}. Detalles: {message}"
                    error = True
                pallet.fase = fase
                pallet.save()
                print(fase)
                print(message)
                return Response(sap_response)
            except Exception as e:
                print(e)
                return Response({"error": f"Error: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Pallet.DoesNotExist:
            return Response({"error": "Pallet not found."}, status=status.HTTP_404_NOT_FOUND)



def getThermoQR(serialNo: str) -> Dict[str, Any]:
    # *** SIMULACIÓN DE LA RESPUESTA DE LA API ***
    # Se utiliza la salida que proporcionaste para la demostración
    simulated_response = {
        "Outputs": {
            "CDU_Data": '{"PARENTSERIALNUMBER":"AAAA0001","PARENTPRODUCTNUMBER":"515380100","ORDERNUMBER":"102666401","DATA":"2025-11-14T14:17:57.883","USER":"ex_romilsonUS10","COMPONENTQUANTITY":7,"COMPONENTS":[{"SERIALNUMBER":"...Lcdvf","PRODUCTNUMBER":"513805037...L","PRODUCTDESCRIPTION":"Compressor FMFD 413UE 230V 53-167Hz","PRODUCTGROUP":"30.32","TESTRESULTS":[]},{"SERIALNUMBER":"B004","PRODUCTNUMBER":"519301201","PRODUCTDESCRIPTION":"CF10C03 U 0.0 XX A XX","PRODUCTGROUP":"31.13","TESTRESULTS":[]},{"SERIALNUMBER":"AC5SHPBL","PRODUCTNUMBER":"215251070","PRODUCTDESCRIPTION":"Electrical Box Subassembly","PRODUCTGROUP":"22.11","TESTRESULTS":[]},{"SERIALNUMBER":"599","PRODUCTNUMBER":"15251677","PRODUCTDESCRIPTION":"Cap tube Assembly Grooved Wrapper","PRODUCTGROUP":"02.06","TESTRESULTS":[{"FEATURE":"TRANSDUCER_01","VALUE":"105.0036000000"},{"FEATURE":"TRANSDUCER_02","VALUE":"40.6000000000"},{"FEATURE":"TUBE_LENGTH","VALUE":"920.0000000000"},{"FEATURE":"PART_OK","VALUE":"True"},{"FEATURE":"PART_NOK","VALUE":"False"}]},{"SERIALNUMBER":"BBBB0002","PRODUCTNUMBER":"513805037...L","PRODUCTDESCRIPTION":"Compressor FMFD 413UE 230V 53-167Hz","PRODUCTGROUP":"30.32","TESTRESULTS":[]},{"SERIALNUMBER":"B0j","PRODUCTNUMBER":"517009997","PRODUCTDESCRIPTION":"Electronic fan - Prototype - 25W","PRODUCTGROUP":"00.00","TESTRESULTS":[]},{"SERIALNUMBER":"B002","PRODUCTNUMBER":"519301201","PRODUCTDESCRIPTION":"CF10C03 U 0.0 XX A XX","PRODUCTGROUP":"31.13","TESTRESULTS":[]}]}'
        }
    }
    
    # En un entorno real, usarías el siguiente bloque:
    # url = "http://10.13.36.159/Apriso/httpServices/operations/GenealogySendParentData"
    # payload = { "inputs":{ "SerialNo":"AAAA0001", "Facility": "US10", "WorkCenter": "MXSG001" } }
    # headers = { "Content-Type": "application/json", "Accept": "application/json" }
    # try:
    #     response = requests.post(url, json=payload, headers=headers)
    #     response.raise_for_status()
    #     return response.json()
    # except requests.exceptions.RequestException as e:
    #     return {"error": str(e)}

    url = "http://mesbr.nidec-ga.com/Apriso/httpServices/operations/GenealogySendParentData"

    # Datos que se enviarán en el cuerpo del POST
    payload = { "inputs":{
                "SerialNo": serialNo,
                "Facility": "US10",
                "WorkCenter": "MXSG001"
                }
             }


    # Cabeceras (puedes agregar token o headers específicos si la API los requiere)
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)

        # Lanza error si la respuesta HTTP no es exitosa
        response.raise_for_status()

        # Retorna la respuesta en formato JSON
        return response.json()

    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

    return simulated_response # Retorna la respuesta simulada


# ---------------------------------------------------------------------
# CLASIFICACIÓN Y ORDEN
# ---------------------------------------------------------------------

# ---------------------------------------------------------------------
# CLASIFICACIÓN Y ORDEN
# ---------------------------------------------------------------------

def get_component_type(component: Dict[str, Any]) -> str:
    desc = component.get("PRODUCTDESCRIPTION", "").lower()
    group = component.get("PRODUCTGROUP", "")

    if "compressor" in desc or group == "30.32":
        return "Compressor"
    if "fan" in desc:
        return "Fan"
    if "electrical box" in desc:
        return "CE "
    if "cap tube" in desc:
        return "Captube"
    if "cf10c03" in desc:
        return "Inverter"
    if "parentproductnumber" in desc:
        return "CDUAssembly"
    if "parentserialnumber" in desc:
        return "CDUAssembly"
    if "exbps" in desc:
        return "Expansion HUB"
    if "tube_length" in desc:
        return "Captube Length"
    if "trasducer_01" in desc:
        return "Captube Flow"
    if "trasnducer_02" in desc:
        return "Captube Back Pressure"
    return "Fan"


ORDER_PRIORITY = {
    "Compressor": 1,
    "Inverter":2,
    "Fan": 3,
    "Captube": 4,
    "CE": 5,
    "CDUAssembly": 6,
    "Expansion HUB":7,
    "Captube Length": 8,
    "Captube Flow":9,
    "Captube Back Pressure":10,

}


# --- Funciones de Formato ---

def formatear_salida(api_response: Dict[str, Any]) -> List[str]:
    """
    Procesa la respuesta de la API y genera la salida en el formato de la tabla.
    """
    output_lines: List[str] = []
    
    # 1. Decodificar la cadena JSON dentro de CDU_Data
    try:
        cdu_data_str = api_response.get("Outputs", {}).get("CDU_Data")
        if not cdu_data_str:
            return ["Error: 'CDU_Data' no se encontró en la respuesta."]
            
        cdu_data = json.loads(cdu_data_str)
        components = cdu_data.get("COMPONENTS", [])

    except json.JSONDecodeError:
        return ["Error: No se pudo decodificar el JSON de 'CDU_Data'."]
    except Exception as e:
        return [f"Error al procesar la respuesta: {e}"]

    # Mapeo de prefijos para los componentes (ej. 'Compressor', 'Inverter')
    # Esto es una suposición basada en la tabla de la imagen.
    # El orden en la lista COMPONENTS puede no coincidir con el orden de la tabla, 
    # por lo que es mejor iterar y asignar un índice a cada tipo.
    # 🔹 Ordenar componentes por prioridad
    components_sorted = sorted(
        components,
        key=lambda c: ORDER_PRIORITY.get(get_component_type(c), 99)
    )
    
    component_counter: Dict[str, int] = {}

    for component in components_sorted:

        comp_type = get_component_type(component)

        sn = component.get("SERIALNUMBER", "")
        pn = component.get("PRODUCTNUMBER", "")
        desc = component.get("PRODUCTDESCRIPTION", "")
       
        
        # ------------------------------
        # COMPONENTES NORMALES
        # ------------------------------
        component_counter[comp_type] = component_counter.get(comp_type, 0) + 1
        idx = component_counter[comp_type]
        numeroPieza = "0"
        if idx == 1:
            numeroPieza = "STG2"
        elif idx == 2:
            numeroPieza = "STG1"
        else:
            numeroPieza = "0"

        # Nombre final
        if comp_type == "Compressor":
            name = f"Compressor{numeroPieza}"
        else:
            # Nombre Final Inverter
            if comp_type =="Inverter":
                name = f"Inverter{idx}"
            else:
                name = comp_type
        
        output_lines.append(f"{name} PN: {pn}")
        output_lines.append(f"{name} SN: {sn}")
     
    sn = cdu_data.get("PARENTSERIALNUMBER", "")
    pn = cdu_data.get("PARENTPRODUCTNUMBER", "")
    order_number = cdu_data.get("ORDERNUMBER", "")
    output_lines.append(f"Order: {order_number}")
    output_lines.append(f"CDUAssembly PN: {pn}")
    output_lines.append(f"CDUAssembly SN: {sn}")


    for component in components_sorted:

        comp_type = get_component_type(component)
        subc  = component.get("SUBCOMPONENTS", [])
        

        if comp_type == "RE ":
            for subcomp in subc:
                pdesc = subcomp.get("PRODUCTDESC","").upper()
                if "EXBPS" in pdesc:
                    pn = subcomp.get("PRODUCTNO", "")
                    sn = subcomp.get("SERIAL", "")
                    output_lines.append(f"ExpansionHub PN: {pn}")
                    output_lines.append(f"ExpansionHub SN: {sn}")

    for component in components_sorted:

        comp_type = get_component_type(component)
    
        tests = component.get("TESTRESULTS", [])

        # ------------------------------
        # CAP TUBE (SOLO RESULTADOS)
        # ------------------------------
        if comp_type == "Captube":
            for result in tests:
                feature = result.get("FEATURE", "").upper()
                value = result.get("VALUE", "")


                if feature == "TRANSDUCER_02":
                    output_lines.append(f"Captube Flow: {float(value):.1f}")
                elif feature == "TRANSDUCER_01":
                    output_lines.append(f"Captube Back Pressure: {float(value):.1f}")
                elif feature == "TUBE_LENGTH":
                    output_lines.append(f"Captube Length: {float(value):.1f}")

            #continue  # no PN/SN para cap tube


    #for component in cdu_data["Outputs"]["CDU_Data"]["COMPONENTS"]:
    #    for sub in component.get("SUBCOMPONENTS", []):
    #        if "exbps" in sub.get("PRODUCTDESC", "").lower():
    #            result = sub["PRODUCTDESC"]
    #            sn = sub["PRODUCTDESC"]
     #           pn = sub["PRODUCTDESC"]
      #          output_lines.append(f"ExpansionHub PN: {pn}")
       #         output_lines.append(f"ExpansionHub SN: {sn}")


    return output_lines


class QRThermoAPIView(APIView):
    def post(self, request):
        data = request.data  # <-- DRF ya parseó el JSON
        serial = data.get("serialNo").strip()  # <-- aquí llega directo
        if not serial:
            return Response({"error": "SerialNo es obligatorio"}, status=400)

        resultado_api = getThermoQR(serial)
        salida_formateada = formatear_salida(resultado_api)
        return Response(salida_formateada)
        
        #data = request.data
        # Limpiar espacios y saltos de línea
        #txt = data.get("_content")
        # Convertir a dict
        #decoded = json.loads(txt)
        # Obtener SerialNo
        #serial = decoded.get("SerialNo")
        #resultado_api = getThermoQR(serial)
        #salida_formateada = formatear_salida(resultado_api)
        #return Response(salida_formateada)

