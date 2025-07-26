// src/hooks/useSaleForm.js

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { saleSchema } from '../schemas/saleSchema';
import Swal from 'sweetalert2';

const IVA_RATE = 0.13;

/**
 * Hook personalizado para manejar toda la lógica del formulario de Ventas.
 * Encapsula react-hook-form, la gestión del editor de línea y los cálculos.
 */
export const useSaleForm = () => { // Ya no necesita initialData como argumento
  // =================================================================
  // 1. CONFIGURACIÓN DEL FORMULARIO PRINCIPAL (react-hook-form)
  // =================================================================
  const formMethods = useForm({
    resolver: zodResolver(saleSchema),
    // Los valores por defecto ahora son siempre para un formulario nuevo y vacío.
    defaultValues: {
      clientId: 0,
      documentNumber: '',
      saleDescription: '',
      issueDate: new Date().toISOString().slice(0, 10),
      saleType: 'CONTADO',
      moduleType: 'Ventas',
      subtotalAmount: 0,
      vatAmount: 0,
      totalAmount: 0,
      saleDetails: [],
    },
  });

  const { control, setValue, watch } = formMethods;

  // --- SE ELIMINA EL useEffect PROBLEMÁTICO DE AQUÍ ---


  // =================================================================
  // 2. GESTIÓN DE LÍNEAS DE DETALLE (useFieldArray)
  // =================================================================
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'saleDetails'
  });


  // =================================================================
  // 3. ESTADO Y LÓGICA DEL EDITOR DE LÍNEA
  // =================================================================
  const [editorTipo, setEditorTipo] = useState('Producto');
  const [editorSelectedProduct, setEditorSelectedProduct] = useState(null);
  const [editorNombreServicio, setEditorNombreServicio] = useState('');
  const [editorCantidad, setEditorCantidad] = useState('1');
  const [editorAplicarImpuesto, setEditorAplicarImpuesto] = useState(true);
  const [editorPrecio, setEditorPrecio] = useState('0');

  const resetLineEditor = () => {
    setEditorSelectedProduct(null);
    setEditorNombreServicio('');
    setEditorCantidad('1');
    setEditorPrecio('0');
    setEditorAplicarImpuesto(true);
  };


  // =================================================================
  // 4. MANEJADORES DE ACCIONES (Añadir, Editar, Eliminar Línea)
  // =================================================================
  const handleAddLine = () => {
    const quantity = Number(editorCantidad) || 0;
    const unitPrice = Number(editorPrecio) || 0;
    let detailToAdd;

  if (editorTipo === 'Producto' && editorSelectedProduct) {
      detailToAdd = {
        productId: editorSelectedProduct.idProduct,
        serviceName: null,
        quantity,
        unitPrice,
        subtotal: quantity * unitPrice,
        impuesto: editorAplicarImpuesto,
        // Añadimos los campos de visualización directamente al crear la línea.
        // La tabla ahora solo tendrá que renderizar estos datos.
        _productName: editorSelectedProduct.label,
        _productCode: editorSelectedProduct.codigo,
      };
    } else if (editorTipo === 'Servicio' && editorNombreServicio && editorNombreServicio.trim()) {
      detailToAdd = {
        productId: null,
        serviceName: editorNombreServicio.trim(),
        quantity,
        unitPrice,
        subtotal: quantity * unitPrice,
        impuesto: editorAplicarImpuesto,
      };
    }

    if (detailToAdd && detailToAdd.unitPrice > 0 && detailToAdd.quantity > 0) {
      append(detailToAdd);
      resetLineEditor();
    } else {
      Swal.fire('Datos Incompletos', 'Por favor, completa los datos del producto/servicio, precio y cantidad.', 'warning');
    }
  };

  const handleDeleteLine = (index) => {
    Swal.fire({
      title: '¿Eliminar esta línea?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, conservar',
    }).then(result => {
      if (result.isConfirmed) remove(index);
    });
  };

  const handleEditLine = (index, productOptions) => {
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


  // =================================================================
  // 5. CÁLCULO AUTOMÁTICO DE TOTALES (Con la guarda de seguridad)
  // =================================================================
  const watchedDetails = useWatch({ control, name: 'saleDetails' });

  useEffect(() => {
    if (!watchedDetails) return;

    const subtotalAmount = watchedDetails.reduce((sum, line) => sum + line.subtotal, 0);
    const vatAmount = watchedDetails.reduce((sum, line) => sum + (line.impuesto ? line.subtotal * IVA_RATE : 0), 0);
    const totalAmount = subtotalAmount + vatAmount;

    setValue('subtotalAmount', parseFloat(subtotalAmount.toFixed(2)));
    setValue('vatAmount', parseFloat(vatAmount.toFixed(2)));
    setValue('totalAmount', parseFloat(totalAmount.toFixed(2)));
  }, [watchedDetails, setValue]);
  

  // =================================================================
  // 6. PREPARACIÓN DE DATOS PARA ENVÍO (Submit)
  // =================================================================
  const prepareSubmitData = (formData) => {
    const cleanDetails = formData.saleDetails.map(({ impuesto, _productName, _productCode,...rest }) => rest);
    // Construimos una fecha y hora completamente nuevas a partir del momento del envío.
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // Este es el string final que se enviará, siempre basado en la fecha y hora actuales.
    const localDateTimeString = `${year}-${month}-${day}T${timeString}`;

    return {
      ...formData,
      saleDetails: cleanDetails,
      issueDate: localDateTimeString
    };
  };


  // =================================================================
  // 7. VALORES Y FUNCIONES EXPUESTAS POR EL HOOK
  // =================================================================
  return {
    formMethods,
    fields,
    handleDeleteLine,
    handleEditLine,
    lineEditor: {
      tipo: editorTipo,
      setTipo: setEditorTipo,
      selectedProduct: editorSelectedProduct,
      setSelectedProduct: setEditorSelectedProduct,
      nombreServicio: editorNombreServicio,
      setNombreServicio: setEditorNombreServicio,
      cantidad: editorCantidad,
      setCantidad: setEditorCantidad,
      precio: editorPrecio,
      setPrecio: setEditorPrecio,
      aplicarImpuesto: editorAplicarImpuesto,
      setAplicarImpuesto: setEditorAplicarImpuesto,
      subtotal: !isNaN(editorCantidad) && !isNaN(editorPrecio) ? (Number(editorCantidad) * Number(editorPrecio)).toFixed(2) : '0.00',
      handleAdd: handleAddLine,
    },
    prepareSubmitData,
  };
};