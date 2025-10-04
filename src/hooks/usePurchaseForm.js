import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { purchaseSchema } from '../schemas/purchaseSchema';
import { Notifier } from '../utils/alertUtils';

// Tasa de IVA. Debería moverse a un archivo de configuración si se usa en más lugares.
const IVA_RATE = 0.13;

/**
 * Hook personalizado para manejar toda la lógica del formulario de Compras.
 * Es un espejo de useSaleForm.js, adaptado para manejar Productos y Gastos Contables.
 */
export const usePurchaseForm = () => {
  // =================================================================
  // 1. CONFIGURACIÓN DEL FORMULARIO PRINCIPAL (react-hook-form)
  // =================================================================
  const formMethods = useForm({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplierId: 0,
      documentNumber: '',
      purchaseDescription: '',
      issueDate: (() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })(),
      moduleType: 'COMPRAS',
      subtotalAmount: 0,
      vatAmount: 0,
      totalAmount: 0,
      purchaseDetails: [],
    },
  });

  const { control, setValue } = formMethods;

  // =================================================================
  // 2. GESTIÓN DE LÍNEAS DE DETALLE (useFieldArray)
  // =================================================================
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'purchaseDetails',
  });

  // =================================================================
  // 3. ESTADO Y LÓGICA DEL EDITOR DE LÍNEA
  // =================================================================
  const [editorTipo, setEditorTipo] = useState('Producto'); // 'Producto' o 'Gasto'
  const [editorSelectedProduct, setEditorSelectedProduct] = useState(null);
  const [editorSelectedAccount, setEditorSelectedAccount] = useState(null); // <-- NUEVO para cuentas contables
  const [editorLineDescription, setEditorLineDescription] = useState('');
  const [editorCantidad, setEditorCantidad] = useState('1');
  const [editorPrecio, setEditorPrecio] = useState('0');
  const [editorAplicaImpuesto, setEditorAplicaImpuesto] = useState(true);

  // Reinicia el editor a su estado inicial.
  const resetLineEditor = () => {
    setEditorSelectedProduct(null);
    setEditorSelectedAccount(null); // <-- NUEVO
    setEditorLineDescription('');
    setEditorCantidad('1');
    setEditorPrecio('0');
    setEditorAplicaImpuesto(true);
  };


  // =================================================================
  // 4. MANEJADORES DE ACCIONES (Añadir, Editar, Eliminar Línea)
  // =================================================================
  const handleAddLine = () => {
    if (fields.length >= 15) {
      Notifier.warning('Una compra no puede tener más de 15 líneas.');
      return;
    }

    const quantity = Number(editorCantidad) || 0;
    const unitPrice = Number(editorPrecio) || 0;
    let detailToAdd = null;

    // Lógica para añadir un PRODUCTO
    if (editorTipo === 'Producto' && editorSelectedProduct) {
      detailToAdd = {
        productId: editorSelectedProduct.idProduct,
        catalogId: null,
        lineDescription: null,
        quantity,
        unitPrice,
        subtotal: quantity * unitPrice,
        tax: editorAplicaImpuesto,
        // Campos de visualización para la tabla
        _displayName: editorSelectedProduct.label,
        _displayCode: editorSelectedProduct.codigo,
      };
    } 
    // Lógica para añadir un GASTO (Cuenta Contable)
    else if (editorTipo === 'Gasto' && editorSelectedAccount) {
      detailToAdd = {
        productId: null,
        catalogId: editorSelectedAccount.idCatalog,
        lineDescription: editorLineDescription.trim(),
        quantity,
        unitPrice,
        subtotal: quantity * unitPrice,
        tax: editorAplicaImpuesto,
        // Campos de visualización para la tabla
        _displayName: editorSelectedAccount.label,
        _displayCode: editorSelectedAccount.codigo,
      };
    }

    if (detailToAdd && detailToAdd.unitPrice > 0 && detailToAdd.quantity > 0) {
      append(detailToAdd);
      resetLineEditor();
    } else {
      Notifier.warning('Por favor, completa los datos del ítem, la cantidad y el precio.');
    }
  };

  const handleDeleteLine = async (index) => {
    const result = await Notifier.confirm({
      title: '¿Eliminar esta línea?',
      text: 'Esta acción no se puede deshacer.',
      confirmButtonText: 'Sí, eliminar',
    });
    
    if (result.isConfirmed) {
      remove(index);
    }
  };

  /**
   * Carga los datos de una línea existente en el editor para su modificación.
   * @param {number} index - El índice de la línea a editar.
   * @param {Array} productOptions - Opciones para el selector de productos.
   * @param {Array} accountOptions - Opciones para el selector de cuentas.
   */
  const handleEditLine = (index, productOptions, accountOptions) => {
    const lineToEdit = fields[index];
    
    if (lineToEdit.productId) {
      setEditorTipo('Producto');
      const productData = productOptions.find(p => p.value === lineToEdit.productId);
      setEditorSelectedProduct(productData);
      setEditorSelectedAccount(null);
    } else if (lineToEdit.catalogId) {
      setEditorTipo('Gasto');
      
      // --- INICIO DE LA CORRECCIÓN ---
      // En lugar de buscar, construimos el objeto que react-select necesita
      // a partir de los datos que ya tenemos en la línea.
      const accountData = {
        value: lineToEdit.catalogId,
        label: lineToEdit._displayName, // El useEffect en EditPurchase ya nos da el nombre
        idCatalog: lineToEdit.catalogId,
        codigo: lineToEdit._displayCode,
      };
      setEditorSelectedAccount(accountData); // <-- Ahora seteamos el objeto correcto
      // --- FIN DE LA CORRECCIÓN ---

      setEditorSelectedProduct(null);
    }

    setEditorLineDescription(lineToEdit.lineDescription || ''); 
    setEditorCantidad(String(lineToEdit.quantity));
    setEditorPrecio(String(lineToEdit.unitPrice));
    setEditorAplicaImpuesto(lineToEdit.tax);
    remove(index); // Se remueve la línea para ser re-añadida con los cambios.
  };

  // =================================================================
  // 5. CÁLCULO AUTOMÁTICO DE TOTALES
  // =================================================================
  const watchedDetails = useWatch({ control, name: 'purchaseDetails' });

  useEffect(() => {
    if (!watchedDetails) return;

    const subtotalAmount = watchedDetails.reduce((sum, line) => sum + line.subtotal, 0);
    const vatAmount = watchedDetails.reduce((sum, line) => sum + (line.tax ? line.subtotal * IVA_RATE : 0), 0);
    const totalAmount = subtotalAmount + vatAmount;

    // Actualiza los campos del formulario con los nuevos totales.
    setValue('subtotalAmount', parseFloat(subtotalAmount.toFixed(2)));
    setValue('vatAmount', parseFloat(vatAmount.toFixed(2)));
    setValue('totalAmount', parseFloat(totalAmount.toFixed(2)));
  }, [watchedDetails, setValue]);
  

  // =================================================================
  // 6. PREPARACIÓN DE DATOS PARA ENVÍO AL BACKEND
  // =================================================================
  const prepareSubmitData = (formData) => {
    // Limpia los campos temporales de visualización antes de enviar.
    const cleanDetails = formData.purchaseDetails.map(({ _displayName, _displayCode, ...rest }) => rest);
    
    // Formatea la fecha para que coincida con el tipo LocalDateTime del backend.
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const localDateTimeString = `${formData.issueDate}T${timeString}`;

    return {
      ...formData,
      purchaseDetails: cleanDetails,
      issueDate: localDateTimeString,
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
      selectedAccount: editorSelectedAccount, // <-- NUEVO
      setSelectedAccount: setEditorSelectedAccount, // <-- NUEVO
      lineDescription: editorLineDescription,         // <-- 5. EXPONER EL ESTADO
      setLineDescription: setEditorLineDescription,   // <-- 5. EXPONER EL SETTER
      cantidad: editorCantidad,
      setCantidad: setEditorCantidad,
      precio: editorPrecio,
      setPrecio: setEditorPrecio,
      aplicaImpuesto: editorAplicaImpuesto,
      setAplicaImpuesto: setEditorAplicaImpuesto,
      subtotal: !isNaN(editorCantidad) && !isNaN(editorPrecio) ? (Number(editorCantidad) * Number(editorPrecio)).toFixed(2) : '0.00',
      handleAdd: handleAddLine,
    },
    prepareSubmitData,
  };
};