// src/hooks/usePurchaseCreditNoteForm.js

import { useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// NOTA: El esquema Zod puede necesitar un ajuste menor si es muy estricto con 'quantityToReturn'.
// Por ahora, asumimos que se adaptará.
import { purchaseCreditNoteSchema } from '../schemas/purchaseCreditNoteSchema';
import { Notifier } from '../utils/alertUtils';

const IVA_RATE = 0.13;

export const usePurchaseCreditNoteForm = () => {
  const formMethods = useForm({
    resolver: zodResolver(purchaseCreditNoteSchema),
    defaultValues: {
      documentNumber: '',
      description: '',
      issueDate: (() => {
        const today = new Date();
        const year = today.getFullYear();
        // getMonth() es 0-indexado, por eso se suma 1.
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })(),
      purchaseId: null,
      subtotalAmount: 0,
      vatAmount: 0,
      totalAmount: 0,
      details: [],
    },
    mode: 'onBlur'
  });

  const { control, setValue, getValues, trigger } = formMethods;
  
  const { fields, replace, remove } = useFieldArray({
    control,
    name: 'details'
  });
  const watchedDetails = useWatch({ control, name: 'details' });

  // --- LÓGICA DE CÁLCULO DE TOTALES (AHORA BASADA EN 'quantity') ---
  useEffect(() => {
    if (!watchedDetails) return;

    const subtotal = watchedDetails.reduce((sum, item) => {
      const quantity = item.quantity || 0; // Usamos 'quantity'
      const price = item.unitPrice || 0;
      return sum + (quantity * price);
    }, 0);

    const vat = watchedDetails.reduce((sum, item) => {
      if (item.tax) { // 'tax' ahora es el nombre correcto del campo de impuesto
        const quantity = item.quantity || 0;
        const price = item.unitPrice || 0;
        return sum + (quantity * price * IVA_RATE);
      }
      return sum;
    }, 0);
    
    setValue('subtotalAmount', parseFloat(subtotal.toFixed(2)));
    setValue('vatAmount', parseFloat(vat.toFixed(2)));
    setValue('totalAmount', parseFloat((subtotal + vat).toFixed(2)));
  }, [watchedDetails, setValue]);

   // --- INICIO DE LA CORRECCIÓN: useEffect para el SUBTOTAL DE CADA FILA ---
  useEffect(() => {
    // Este efecto se ejecutará cada vez que 'watchedDetails' cambie.
    const details = getValues('details');
    let changed = false;

    details.forEach((detail, index) => {
      const quantity = detail.quantity || 0;
      const unitPrice = detail.unitPrice || 0;
      const newSubtotal = parseFloat((quantity * unitPrice).toFixed(2));

      // Comparamos el subtotal calculado con el que ya está en el formulario.
      if (detail.subtotal !== newSubtotal) {
        // Si son diferentes, actualizamos el valor de 'subtotal' para esa fila específica.
        setValue(`details.${index}.subtotal`, newSubtotal, { shouldValidate: false });
        changed = true;
      }
    });

    // Si hemos hecho algún cambio, disparamos la validación de los totales generales.
    if (changed) {
      trigger(['subtotalAmount', 'vatAmount', 'totalAmount']);
    }
  }, [watchedDetails, setValue, getValues, trigger]);

  // --- LÓGICA DE POBLADO DEL FORMULARIO (MODIFICADA) ---
  const updateFormWithPurchaseDetails = (purchase) => {
    if (!purchase) {
      replace([]);
      setValue('purchaseId', null);
      return;
    }
    setValue('purchaseId', purchase.idPurchase);

    const detailsForForm = purchase.purchaseDetails.map(detail => ({
      productId: detail.product ? detail.product.idProduct : null,
      catalogId: detail.catalog ? detail.catalog.id : null,
      
      // La cantidad a devolver es ahora la cantidad original, y es editable.
      quantity: detail.quantity,
      
      unitPrice: detail.unitPrice,
       subtotal: parseFloat((detail.quantity * detail.unitPrice).toFixed(2)), 
      tax: detail.tax, // El valor del impuesto se trae directamente de la compra original.
      
      // Campos de visualización (sin cambios)
      _displayName: detail.product?.productName || detail.catalog?.accountName || detail.lineDescription,
      _displayCode: detail.product?.productCode || detail.catalog?.accountCode || 'N/A',
    }));
    replace(detailsForForm);
  };

  // --- PREPARACIÓN DE DATOS PARA ENVÍO (MODIFICADA) ---
  const prepareSubmitData = (formData) => {
    // Filtramos los detalles donde la cantidad sea mayor a 0 y limpiamos los campos temporales.
    const detailsToSubmit = formData.details
      .filter(d => d.quantity > 0)
      .map(d => ({
        productId: d.productId,
        catalogId: d.catalogId,
        quantity: d.quantity,
        unitPrice: d.unitPrice,
        subtotal: parseFloat((d.quantity * d.unitPrice).toFixed(2)),
        tax: d.tax,
        lineDescription: d._displayName,
      }));
    
    if (detailsToSubmit.length === 0) {
      Notifier.error("La nota de crédito debe tener al menos un ítem con cantidad mayor a cero.");
      return null;
    }

    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const localDateTimeString = `${formData.issueDate}T${timeString}`;

    const finalDTO = {
      ...formData,
      issueDate: localDateTimeString,
      subtotalAmount: formData.subtotalAmount,
      vatAmount: formData.vatAmount,
      totalAmount: formData.totalAmount,
      details: detailsToSubmit,
    };
    return finalDTO;
  };

  return {
    formMethods,
    fields,
    remove, // <-- Aseguramos que 'remove' se exporte para el botón de eliminar.
    updateFormWithPurchaseDetails,
    prepareSubmitData,
  };
};