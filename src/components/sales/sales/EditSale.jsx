// src/components/sales/sales/EditSale.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCustomerService } from '../../../services/sales/customerService';
import { SaleService } from '../../../services/sales/SaleService';
import { useSaleForm } from '../../../hooks/useSaleForm';
import SaleForm from './SaleForm';
import { Notifier } from '../../../utils/alertUtils';
import { useActiveProducts } from '../../../hooks/useProductQueries'; 

export default function EditSale() {
  const { saleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { updateSale, getSaleById } = SaleService();
  const { data: activeProducts, isLoading: isLoadingProducts } = useActiveProducts();
  const { getById: getCustomerById} = useCustomerService();

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

  const productOptions = React.useMemo(() => {
    if (!activeProducts) return [];
    return activeProducts.map(p => ({ 
        value: p.idProduct, 
        label: p.productName, 
        codigo: p.productCode, 
        idProduct: p.idProduct 
    }));
  }, [activeProducts]);

  
  // Desestructuramos para tener acceso directo a los métodos del formulario
  const formLogic = useSaleForm();
  const { setValue, getValues } = formLogic.formMethods; // <-- AÑADIMOS getValues


  useEffect(() => {
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
      
      setValue('clientId', saleToEdit.customer.clientId);
      setValue('documentNumber', saleToEdit.documentNumber);
      setValue('saleDescription', saleToEdit.saleDescription);
      

      const detailsForForm = saleToEdit.saleDetails.map(detail => {
        let productName = '';
        let productCode = '';
        let isInvalid = false; // Nuestra nueva bandera
        if (detail.product) {
          const productInfo = productOptions.find(p => p.value === detail.product.idProduct);
           if (productInfo) {
            // El producto se encontró en la lista de activos, todo bien.
            productName = productInfo.label;
            productCode = productInfo.codigo;
          } else {
            // ¡AQUÍ ESTÁ LA MAGIA! El producto no se encontró.
            productName = 'PRODUCTO DESACTIVADO O ELIMINADO';
            productCode = 'Inválido';
            isInvalid = true; // Marcamos la línea como inválida.
          }
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
          _isInvalid: isInvalid, // <-- AÑADIMOS LA BANDERA AL OBJETO DEL DETALLE
        };
      });
      setValue('saleDetails', detailsForForm);
    }
  }, [saleToEdit, setValue, navigate, productOptions, isLoadingProducts]);

  const { mutate: submitUpdate, isPending: isSaving } = useMutation({
    mutationFn: (data) => updateSale(data.saleId, data.dto),
    onSuccess: (updatedSale) => {
      Notifier.success(`Venta #${updatedSale.documentNumber} actualizada con éxito.`);
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      navigate('/ventas/ventas');
    },
    onError: (error) => {
      Notifier.showError('Error al Actualizar', error.response?.data?.message || 'Ocurrió un error.');
    },
  });

  const onFormSubmit = (formData) => {
     // 1. Obtenemos los valores COMPLETOS y SIN LIMPIAR del formulario.
    const fullFormData = getValues(); 

    // 2. Ahora, ejecutamos la validación sobre ESTOS datos, que SÍ contienen nuestra bandera.
    const hasInvalidItems = fullFormData.saleDetails.some(detail => detail._isInvalid === true);
    if (hasInvalidItems) {
      Swal.fire({
        icon: 'error',
        title: 'Venta con Errores',
        text: 'No puedes guardar una venta que contiene productos desactivados o eliminados. Por favor, elimina las líneas marcadas en rojo.',
      });
      return; // Detenemos el envío
    }
    const dto = formLogic.prepareSubmitData(formData);
    submitUpdate({ saleId, dto });
  };
  


  if (isLoadingSale || isLoadingClient) {
    return <main className="container-lg text-center p-5"><h2>Cargando datos de la venta...</h2></main>;
  }
  
  if (isError || !saleToEdit) {
     return <main className="container-lg text-center p-5"><h2>Venta no encontrada o error al cargar.</h2></main>;
  }

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
      submitButtonText="Guardar Cambios"
    />
  );
}