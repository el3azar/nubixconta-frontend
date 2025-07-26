// src/components/sales/sales/EditSale.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCustomerService } from '../../../services/sales/customerService';
import { useProductService } from '../../../services/inventory/useProductService';
import { SaleService } from '../../../services/sales/SaleService';
import { useSaleForm } from '../../../hooks/useSaleForm';
import SaleForm from './SaleForm';
import Swal from 'sweetalert2';

/**
 * Componente "Contenedor" para editar una venta existente.
 * RESPONSABILIDADES:
 * 1. Cargar datos de la venta a editar, cliente y productos.
 * 2. Poblar el formulario con los datos cargados.
 * 3. Configurar y ejecutar la mutación de `updateSale`.
 * 4. Renderizar `SaleForm` pasándole toda la información.
 */
export default function EditSale() {
  const { saleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Servicios
  const { updateSale, getSaleById } = SaleService();
  const { getActiveProducts } = useProductService();
  const { getCustomerById } = useCustomerService();

  // 1. LÓGICA DE DATOS (QUERIES)
  const { data: saleToEdit, isLoading: isLoadingSale, isError } = useQuery({
    queryKey: ['sale', saleId],
    queryFn: () => getSaleById(saleId),
    enabled: !!saleId,
  });

  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ['customer', saleToEdit?.customer?.clientId],
    queryFn: () => getCustomerById(saleToEdit.customer.clientId),
    enabled: !!saleToEdit?.customer?.clientId,
  });

  const { data: productOptions, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['activeProducts'],
    queryFn: async () => {
      const products = await getActiveProducts();
      return products.map(p => ({ value: p.idProduct, label: p.productName, codigo: p.productCode, idProduct: p.idProduct }));
    },
    initialData: [],
  });

  // 2. INSTANCIACIÓN DEL HOOK DEL FORMULARIO (ahora es más simple)
  const formLogic = useSaleForm();
  const { reset, setValue } = formLogic.formMethods; // <-- Se añade setValue

  // 3. LÓGICA PARA POBLAR EL FORMULARIO (corregida y robusta)
   useEffect(() => {
    // --- INICIO DE LA CORRECCIÓN PARA LA VISUALIZACIÓN DE LA TABLA ---
    // Este efecto ahora espera a que tanto la venta como las opciones de productos estén listas.
    if (saleToEdit && !isLoadingProducts) {
      if (saleToEdit.saleStatus !== 'PENDIENTE') {
        Swal.fire({
          icon: 'error',
          title: 'Acción no permitida',
          text: `No se puede editar una venta en estado "${saleToEdit.saleStatus}".`,
          confirmButtonColor: '#49207B'
        }).then(() => navigate('/ventas/ventas'));
        return;
      }
     // --- INICIO DE LA RESTAURACIÓN DE LA LÓGICA ORIGINAL ---
      // Se puebla el formulario campo por campo, como en tu código original.
      // Esto es más explícito y menos propenso a errores que el 'reset' masivo.
      setValue('clientId', saleToEdit.customer.clientId);
      setValue('documentNumber', saleToEdit.documentNumber);
      setValue('saleDescription', saleToEdit.saleDescription);
      
      // Para la fecha, se establece explícitamente la fecha actual.
      setValue('issueDate', new Date().toISOString().slice(0, 10));

      // Se pueblan los detalles enriquecidos
      const detailsForForm = saleToEdit.saleDetails.map(detail => {
        let productName = '';
        let productCode = '';
        if (detail.product) {
          const productInfo = productOptions.find(p => p.value === detail.product.idProduct);
          productName = productInfo?.label || 'Producto no encontrado';
          productCode = productInfo?.codigo || 'N/A';
        }
        return {
          productId: detail.product ? detail.product.idProduct : null,
          serviceName: detail.serviceName,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          subtotal: detail.subtotal,
          impuesto: saleToEdit.vatAmount > 0,
          _productName: productName, 
          _productCode: productCode,
        };
      });
      setValue('saleDetails', detailsForForm);
      // --- FIN DE LA RESTAURACIÓN ---
    
    }
  }, [saleToEdit, reset, navigate, productOptions, isLoadingProducts]);
  // --- FIN DE LA CORRECCIÓN ---

  // 4. LÓGICA DE DATOS (MUTATION)
  const { mutate: submitUpdate, isPending: isSaving } = useMutation({
    mutationFn: (data) => updateSale(data.saleId, data.dto),
    onSuccess: (updatedSale) => {
      Swal.fire('Venta Actualizada', `La venta #${updatedSale.documentNumber} se guardó con éxito.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      navigate('/ventas/ventas');
    },
    onError: (error) => {
      Swal.fire('Error al Actualizar', error.response?.data?.message || 'Ocurrió un error.', 'error');
    },
  });

  // 5. MANEJADORES DE EVENTOS DEL CONTENEDOR
  const onFormSubmit = (formData) => {
    const dto = formLogic.prepareSubmitData(formData);
    submitUpdate({ saleId, dto });
  };
  
  const handleCancel = () => {
    Swal.fire({
      title: '¿Descartar cambios?', text: 'Volverás a la lista de ventas.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí, descartar', cancelButtonText: 'No',
    }).then(result => {
      if (result.isConfirmed) navigate('/ventas/ventas');
    });
  };

  // 6. RENDERIZADO
  if (isLoadingSale || isLoadingClient) {
    return <main className="container-lg text-center p-5"><h2>Cargando datos de la venta...</h2></main>;
  }
  
  if (isError || !saleToEdit) {
     return <main className="container-lg text-center p-5"><h2>Venta no encontrada o error al cargar.</h2></main>;
  }

  // --- CORRECCIÓN DEL TYPO onFormSubmit ---
  return (
    <SaleForm
      title="Editar Venta"
      client={client}
      isLoadingClient={isLoadingClient}
      productOptions={productOptions}
      isLoadingProducts={isLoadingProducts}
      isSaving={isSaving}
      formLogic={formLogic}
      onFormSubmit={onFormSubmit}
      onCancel={handleCancel}
      submitButtonText="Guardar Cambios"
    />
  );
}