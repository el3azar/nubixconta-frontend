import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { creditNoteSchema } from '../schemas/creditNoteSchema'; // DEBERÁS CREAR ESTE ESQUEMA ZOD
import { useEffect } from 'react';

const IVA_RATE = 0.13;

export const useCreditNoteForm = (clientId=null) => {
  const formMethods = useForm({
    resolver: zodResolver(creditNoteSchema),
    defaultValues: {
      documentNumber: '',
      description: '',
      issueDate: new Date().toISOString().slice(0, 10), 
      saleId: null,
      clientId: parseInt(clientId, 10) || 0,
      subtotalAmount: 0,
      vatAmount: 0,
      totalAmount: 0,
      details: [],
    }
  });

 const { control, setValue, reset, replace: setDetails } = formMethods; // Renombramos 'replace' para mayor claridad

  const { fields, remove, replace } = useFieldArray({
    control,
    name: 'details'
  });

  const watchedDetails = useWatch({ control, name: 'details' });

  useEffect(() => {
    if (!watchedDetails) return;

    const subtotal = watchedDetails.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vat = watchedDetails.reduce((sum, item) => {
      // Asumimos que el impuesto viene del detalle original de la venta
      return item.impuesto ? sum + (item.quantity * item.unitPrice * IVA_RATE) : sum;
    }, 0);
    
    setValue('subtotalAmount', subtotal);
    setValue('vatAmount', vat);
    setValue('totalAmount', subtotal + vat);

  }, [watchedDetails, setValue]);

 // --- ¡AQUÍ ESTÁ LA CORRECCIÓN MÁS IMPORTANTE! ---
  const updateFormWithSaleDetails = (sale) => {
    if (!sale) {
      replace([]); // Ahora 'replace' está definido y funciona.
      setValue('saleId', null);
      return;
    }
    // Determinamos si la venta original tenía IVA en general.
    const saleHadVat = sale.vatAmount > 0;

    // Transformamos los detalles de la venta a la estructura que nuestro formulario espera.
    const detailsForForm = sale.saleDetails.map(detail => ({
      // Mantenemos el ID original del detalle de la venta si lo necesitamos
      saleDetailId: detail.saleDetailId,
      
      // Creamos la propiedad 'productId' que Zod espera
      productId: detail.product ? detail.product.idProduct : null,
      
      // Mantenemos el objeto 'product' completo para mostrar el nombre/código en la UI
      product: detail.product,
      
      // Copiamos el resto de los campos relevantes
      serviceName: detail.serviceName,
      quantity: detail.quantity,
      unitPrice: detail.unitPrice,
      subtotal: detail.subtotal,

      // Se establece el valor por defecto en 'false' para todas las líneas.
      // Esto es más seguro, ya que evita sobre-calcular el impuesto por defecto
      // y fuerza al usuario a marcar explícitamente las líneas que sí lo llevan.
      impuesto: false, 
    }));
    
    setValue('saleId', sale.saleId);
    replace(detailsForForm); // Usamos 'replace' para actualizar el array
  };

   // --- INICIO DE LA MODIFICACIÓN ---
  // Se añade la función para preparar los datos para el envío,
  // idéntica a la del hook de ventas.
  const prepareSubmitData = (formData) => {
    const cleanDetails = formData.details.map(({ impuesto, product, saleDetailId, ...rest }) => ({
      ...rest,
      subtotal: parseFloat((rest.quantity * rest.unitPrice).toFixed(2))
    }));
    
    // Se construye el string de fecha y hora local para el backend.
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const localDateTimeString = `${year}-${month}-${day}T${timeString}`;

    const finalDTO = {
      ...formData,
      details: cleanDetails,
      issueDate: localDateTimeString, // Se envía la fecha y hora actuales
      subtotalAmount: formData.subtotalAmount.toFixed(2),
      vatAmount: formData.vatAmount.toFixed(2),
      totalAmount: formData.totalAmount.toFixed(2),
    };
    return finalDTO;
  };

  return {
    ...formMethods,
    fields,
    replace,
    remove,
    updateFormWithSaleDetails,
    prepareSubmitData
  };
};