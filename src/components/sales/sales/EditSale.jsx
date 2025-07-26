import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { SaleService } from '../../../services/sales/SaleService';
import { useProductService } from '../../../services/inventory/useProductService';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerService } from '../../../services/sales/customerService';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saleSchema } from '../../../schemas/saleSchema';
import SaleForm from './SaleForm';

const IVA_RATE = 0.13;

export default function EditSale() {
  // 1. HOOKS DE SERVICIOS Y NAVEGACIÓN
  const { updateSale, getSaleById } = SaleService();
  const { getActiveProducts } = useProductService();
  const { getCustomerById } = useCustomerService();
  const { saleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 2. QUERIES PARA CARGAR DATOS
  const { data: saleToEdit, isLoading: isLoadingSale } = useQuery({
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
      return products.map(p => ({
        value: p.idProduct,
        label: p.productName,
        codigo: p.productCode,
        idProduct: p.idProduct,
      }));
    },
    initialData: [],
  });
  
  // 3. LÓGICA DEL FORMULARIO PRINCIPAL
  const formMethods = useForm({
    resolver: zodResolver(saleSchema),
    // ================== LA CORRECCIÓN ESTÁ AQUÍ ==================
    // Aseguramos que los campos numéricos siempre existan como números.
    defaultValues: {
      documentNumber: '',
      saleDescription: '',
      issueDate: '',
      subtotalAmount: 0,
      vatAmount: 0,
      totalAmount: 0,
      saleDetails: [],
    },
    // =============================================================
  });
  const { handleSubmit, watch, setValue, reset, formState: { errors }, register, control } = formMethods;

  // Efecto para poblar el formulario cuando los datos de la venta se cargan
    useEffect(() => {
    if (saleToEdit) {
      const formValues = {
        ...saleToEdit,
        clientId: saleToEdit.customer.clientId,
        issueDate: saleToEdit.issueDate.slice(0, 10),
        // Transformación explícita de los datos del detalle
        saleDetails: saleToEdit.saleDetails.map(detail => ({
          productId: detail.product ? detail.product.idProduct : null, // Mapea el ID del producto
          serviceName: detail.serviceName,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          subtotal: detail.subtotal,
          impuesto: saleToEdit.vatAmount > 0,
        })),
      };
      reset(formValues);
    }
  }, [saleToEdit, reset]);
  
  const { fields, append, remove } = useFieldArray({ control, name: 'saleDetails' });

  // 4. ESTADOS Y LÓGICA DEL EDITOR DE LÍNEA (IDÉNTICO A NEWSALE)
  const [editorTipo, setEditorTipo] = useState('Producto');
  const [editorSelectedProduct, setEditorSelectedProduct] = useState(null);
  const [editorNombreServicio, setEditorNombreServicio] = useState('');
  const [editorCantidad, setEditorCantidad] = useState('1'); 
  const [editorAplicarImpuesto, setEditorAplicarImpuesto] = useState(true);
  const [editorPrecio, setEditorPrecio] = useState('0');

  const watchedDetails = watch('saleDetails');
  useEffect(() => {
    if (!watchedDetails) return;
    const subtotalAmount = watchedDetails.reduce((sum, line) => sum + line.subtotal, 0);
    const vatAmount = watchedDetails.reduce((sum, line) => sum + (line.impuesto ? line.subtotal * IVA_RATE : 0), 0);
    const totalAmount = subtotalAmount + vatAmount;
    setValue('subtotalAmount', parseFloat(subtotalAmount.toFixed(2)));
    setValue('vatAmount', parseFloat(vatAmount.toFixed(2)));
    setValue('totalAmount', parseFloat(totalAmount.toFixed(2)));
  }, [watchedDetails, setValue]);

  const resetLineEditor = () => {
    setEditorSelectedProduct(null);
    setEditorNombreServicio('');
    setEditorCantidad('1'); // Resetear a string
    setEditorPrecio('0');   // Resetear a string
    setEditorAplicarImpuesto(true);
  };

  const handleAddLine = () => {
    // Se convierten los strings a números ANTES de guardar
    const quantity = Number(editorCantidad) || 0;
    const unitPrice = Number(editorPrecio) || 0;

    let detailToAdd;
    
    if (editorTipo === 'Producto' && editorSelectedProduct) {
      detailToAdd = {
        productId: editorSelectedProduct.idProduct, serviceName: null, quantity,
        unitPrice: unitPrice, subtotal: quantity * unitPrice, impuesto: editorAplicarImpuesto,
      };
    } else if (editorTipo === 'Servicio' && editorNombreServicio.trim()) {
      detailToAdd = {
        productId: null, serviceName: editorNombreServicio.trim(), quantity,
        unitPrice, subtotal: quantity * unitPrice, impuesto: editorAplicarImpuesto,
      };
    }
    if (detailToAdd && detailToAdd.unitPrice > 0 && detailToAdd.quantity > 0) {
      append(detailToAdd);
      resetLineEditor();
    } else {
      Swal.fire({
        title: 'Datos Incompletos', text: 'Por favor, completa los datos del producto/servicio, precio y cantidad.',
        icon: 'warning', confirmButtonColor: '#49207B',
      });
    }
  };

  const handleDeleteLine = (index) => {
    Swal.fire({
      title: '¿Eliminar esta línea?', text: 'Esta acción no se puede deshacer.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'No, conservar',
    }).then(result => {
      if (result.isConfirmed) remove(index);
    });
  };

  const handleEditLine = (index) => {
    const lineToEdit = fields[index];
    if (lineToEdit.productId) {
      setEditorTipo('Producto');
      const productData = productOptions.find(p => p.value === lineToEdit.productId);
      setEditorSelectedProduct(productData);
      setEditorNombreServicio('');
    } else {
      setEditorTipo('Servicio');
      setEditorNombreServicio(lineToEdit.serviceName);
      setEditorSelectedProduct(null);
    }
    // Se establecen los estados del editor como strings para la UI
    setEditorCantidad(String(lineToEdit.quantity));
    setEditorPrecio(String(lineToEdit.unitPrice));
    setEditorAplicarImpuesto(lineToEdit.impuesto);
    remove(index);
  };

  const handleCancel = () => {
    Swal.fire({
      title: '¿Descartar cambios?', text: 'Volverás a la lista de ventas.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí, descartar', cancelButtonText: 'No',
    }).then(result => {
      if (result.isConfirmed) navigate('/ventas/ventas');
    });
  };

  // 5. MUTACIÓN PARA ACTUALIZAR LA VENTA
  const { mutate: submitUpdate, isPending: isSaving } = useMutation({
    mutationFn: (data) => updateSale(data.saleId, data.dto),
    onSuccess: (updatedSale) => {
      Swal.fire({
        icon: 'success', title: '¡Venta Actualizada!', text: `La venta #${updatedSale.documentNumber} se guardó con éxito.`,
        confirmButtonColor: '#49207B'
      });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      navigate('/ventas/ventas');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Ocurrió un error al actualizar la venta.';
      Swal.fire({ icon: 'error', title: 'Error al Actualizar', text: message, confirmButtonColor: '#E2574C' });
    },
  });

  const onFormSubmit = (formData) => {
    const cleanDetails = formData.saleDetails.map(({ impuesto, ...rest }) => rest);
    // --- INICIO DE LA CORRECCIÓN ---
    const now = new Date();
    // Formateamos la fecha y hora LOCALES al formato que Spring Boot espera para LocalDateTime
    // Ejemplo: "2025-07-19T22:15:30"
    const localDateTimeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const finalDTO = { 
        ...formData, 
        saleDetails: cleanDetails, 
        issueDate: localDateTimeString // <-- ENVIAMOS EL STRING LOCAL
    };
    // --- FIN DE LA CORRECCIÓN ---
    submitUpdate({ saleId, dto: finalDTO });
  };
  
  // 6. RENDERIZADO
  if (isLoadingSale || (saleToEdit && isLoadingClient)) {
    return <main className="container-lg text-center p-5"><h2>Cargando datos de la venta...</h2></main>;
  }
  
  // Protección adicional en caso de que no se encuentre la venta
  if (!saleToEdit && !isLoadingSale) {
     return <main className="container-lg text-center p-5"><h2>Venta no encontrada.</h2></main>;
  }


  return (
    <SaleForm
      title="Editar Venta"
      client={client}
      isLoadingClient={isLoadingClient}
      productOptions={productOptions}
      isLoadingProducts={isLoadingProducts}
      isSaving={isSaving}
      handleSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      register={register}
      watch={watch}
      errors={errors}
      fields={fields}
      editorTipo={editorTipo} setEditorTipo={setEditorTipo}
      editorSelectedProduct={editorSelectedProduct} setEditorSelectedProduct={setEditorSelectedProduct}
      editorNombreServicio={editorNombreServicio} setEditorNombreServicio={setEditorNombreServicio}
      editorCantidad={editorCantidad} setEditorCantidad={setEditorCantidad}
      editorPrecio={editorPrecio} setEditorPrecio={setEditorPrecio}
      editorAplicarImpuesto={editorAplicarImpuesto} setEditorAplicarImpuesto={setEditorAplicarImpuesto}
      handleAddLine={handleAddLine}
      handleEditLine={handleEditLine}
      handleDeleteLine={handleDeleteLine}
      handleCancel={handleCancel}
      submitButtonText="Guardar Cambios"
    />
  );
}