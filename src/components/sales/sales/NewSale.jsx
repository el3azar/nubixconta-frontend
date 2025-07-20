// src/components/sales/NewSale.jsx
import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import Swal from 'sweetalert2';
import makeAnimated from 'react-select/animated';
import { SaleService } from '../../../services/sales/SaleService';
import { useProductService } from '../../../services/inventory/useProductService';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerService } from '../../../services/sales/customerService';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saleSchema } from '../../../schemas/saleSchema'; // El nuevo esquema de validación
import SaleForm from './SaleForm';



const IVA_RATE = 0.13;

export default function NewSale() {
  const { createSale } = SaleService();
  const { getActiveProducts } = useProductService();
  const { getCustomerById } = useCustomerService();
  const { clientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ['customer', clientId],
    queryFn: () => getCustomerById(clientId),
    enabled: !!clientId,
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

  const formMethods = useForm({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      clientId: parseInt(clientId, 10) || 0,
      documentNumber: '',
      saleDescription: '',
      issueDate: (() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses son 0-11, se añade 1
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
      saleType: 'CONTADO',
      moduleType: 'Ventas',
      subtotalAmount: 0,
      vatAmount: 0,
      totalAmount: 0,
      saleDetails: [],
    },
  });
  const { handleSubmit, watch, setValue, formState: { errors }, register, control } = formMethods;

  const { fields, append, remove } = useFieldArray({ control, name: 'saleDetails' });

  const [editorTipo, setEditorTipo] = useState('Producto');
  const [editorSelectedProduct, setEditorSelectedProduct] = useState(null);
  const [editorNombreServicio, setEditorNombreServicio] = useState('');
  const [editorCantidad, setEditorCantidad] = useState('1');
  const [editorAplicarImpuesto, setEditorAplicarImpuesto] = useState(true);
  const [editorPrecio, setEditorPrecio] = useState('0'); 

  const watchedDetails = watch('saleDetails');
  useEffect(() => {
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
    setEditorCantidad('1');
    setEditorPrecio('0');
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
        unitPrice, subtotal: quantity * unitPrice, impuesto: editorAplicarImpuesto,
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
    setEditorCantidad(String(lineToEdit.quantity));
    setEditorPrecio(String(lineToEdit.unitPrice));
    setEditorAplicarImpuesto(lineToEdit.impuesto);
    remove(index);
  };

  const handleCancel = () => {
    Swal.fire({
      title: '¿Cancelar venta?', text: 'Perderás los datos ingresados.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí, cancelar', cancelButtonText: 'No',
    }).then(result => {
      if (result.isConfirmed) navigate('/ventas/ventas');
    });
  };

  const { mutate: submitSale, isPending: isSaving } = useMutation({
    mutationFn: (saleData) => createSale(saleData),
    onSuccess: (savedSale) => {
      Swal.fire({
        icon: 'success', title: 'Venta registrada', text: `Venta #${savedSale.documentNumber} registrada con éxito.`,
        confirmButtonColor: '#49207B'
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['sales'] });
        navigate('/ventas/ventas');
      });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Ocurrió un error al guardar la venta.';
      Swal.fire({ icon: 'error', title: 'Error al registrar', text: message, confirmButtonColor: '#E2574C' });
    }
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
    submitSale(finalDTO);
  };

  return (
    <SaleForm
      title="Nueva Venta"
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
      submitButtonText="Registrar Venta"
    />
  );
}