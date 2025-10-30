import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountingTransactionSchema } from '../schemas/accountingTransactionSchema';
import { Notifier } from '../utils/alertUtils';

export const useAccountingTransactionForm = () => {
  // 1. CONFIGURACIÓN DE REACT-HOOK-FORM
  const formMethods = useForm({
    resolver: zodResolver(accountingTransactionSchema),
    defaultValues: {
     transactionDate: (() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })(),
      description: '',
      entries: [],
      // Campos calculados que no son parte del schema, pero útiles en la UI
      totalDebe: 0,
      totalHaber: 0,
    },
  });

  const { control, setValue } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  // 2. ESTADO DEL EDITOR DE LÍNEA
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [debit, setDebit] = useState('');
  const [credit, setCredit] = useState('');

  const resetLineEditor = () => {
    setSelectedAccount(null);
    setDebit('');
    setCredit('');
  };

  // 3. MANEJADORES DE ACCIONES
  const handleAddLine = () => {
    if (!selectedAccount) {
      Notifier.warning('Debe seleccionar una cuenta contable.');
      return;
    }

     const isDuplicate = fields.some(field => field.catalogId === selectedAccount.id);
    if (isDuplicate) {
      Notifier.warning('Esa cuenta contable ya ha sido añadida a la transacción.');
      return;
    }
    
    const debitValue = parseFloat(debit) || 0;
    const creditValue = parseFloat(credit) || 0;

    if (debitValue <= 0 && creditValue <= 0) {
      Notifier.warning('Debe ingresar un valor mayor a cero en el Debe o en el Haber.');
      return;
    }
    
    if (debitValue > 0 && creditValue > 0) {
      Notifier.warning('Una línea solo puede tener un valor en Debe o Haber, no en ambos.');
      return;
    }
    
    // Al añadir la línea, nos aseguramos de incluir los campos de visualización
    // que la tabla (`renderRow`) necesita para mostrar los datos.
    append({
      catalogId: selectedAccount.id,
      debit: debitValue,
      credit: creditValue,
      _accountCode: selectedAccount.code, // <-- Propiedad para mostrar el CÓDIGO
      _accountName: selectedAccount.name,  // <-- Propiedad para mostrar el NOMBRE
    });
    
    resetLineEditor();
  };

  const handleDeleteLine = async (index) => {
    const result = await Notifier.confirm({
      title: '¿Eliminar esta línea?',
      text: 'La acción no se puede deshacer.',
      confirmButtonText: 'Sí, eliminar',
    });
    if (result.isConfirmed) {
      remove(index);
    }
  };

   /**
   * Carga los datos de una línea existente en el editor para su modificación.
   * @param {number} index - El índice de la línea a editar.
   */
  const handleEditLine = (index) => {
    const lineToEdit = fields[index];

    // 1. Reconstruimos el objeto que react-select necesita para mostrar la cuenta.
    const accountData = {
      value: lineToEdit.catalogId,
      label: `${lineToEdit._accountCode} - ${lineToEdit._accountName}`,
      id: lineToEdit.catalogId,
      code: lineToEdit._accountCode,
      name: lineToEdit._accountName,
    };
    
    // 2. Poblamos el editor con los datos de la línea seleccionada.
    setSelectedAccount(accountData);
    setDebit(String(lineToEdit.debit));
    setCredit(String(lineToEdit.credit));

    // 3. Removemos la línea original. El usuario la re-añadirá con los cambios.
    remove(index);
  };

  // 4. CÁLCULO DE TOTALES EN TIEMPO REAL
  const watchedEntries = useWatch({ control, name: 'entries' });

  useEffect(() => {
    if (!watchedEntries) return;

    const totalDebe = watchedEntries.reduce((sum, line) => sum + line.debit, 0);
    const totalHaber = watchedEntries.reduce((sum, line) => sum + line.credit, 0);

    setValue('totalDebe', parseFloat(totalDebe.toFixed(2)));
    setValue('totalHaber', parseFloat(totalHaber.toFixed(2)));
  }, [watchedEntries, setValue]);

  // 5. PREPARACIÓN DE DATOS PARA EL BACKEND
  const prepareSubmitData = (formData) => {
    const cleanEntries = formData.entries.map(({ _accountCode, _accountName, ...rest }) => ({
        ...rest,
        // Aseguramos que los valores sean strings como pide el backend
        debit: rest.debit.toFixed(2),
        credit: rest.credit.toFixed(2),
    }));

    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const localDateTimeString = `${formData.transactionDate}T${timeString}`;

    return {
      transactionDate: localDateTimeString,
      description: formData.description,
      entries: cleanEntries,
    };
  };

  return {
    formMethods,
    fields,
    handleDeleteLine,
    handleEditLine,
    lineEditor: {
      selectedAccount,
      setSelectedAccount,
      debit,
      setDebit,
      credit,
      setCredit,
      handleAdd: handleAddLine,
    },
    prepareSubmitData,
  };
};