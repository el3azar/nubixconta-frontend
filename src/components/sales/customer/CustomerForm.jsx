import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { IMaskInput } from 'react-imask';
import { Notifier } from '../../../utils/alertUtils';
import { customerSchema } from '../../../schemas/customerSchema';
import formStyles from '../../../styles/sales/CustomerForm.module.css';

export const CustomerForm = ({ onFormSubmit, defaultValues, isSubmitting = false, isEditMode = false }) => {
  const navigate = useNavigate();

  // CAMBIO: Se ha limpiado el código. Ya no hay lógica de useIMask o mergeRefs aquí.
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultValues || { personType: 'NATURAL', exemptFromVat: 'false', appliesWithholding: 'false' },
  });

  const personType = watch('personType');

  useEffect(() => {
    // Solo se ejecuta si hay 'defaultValues' (es decir, en modo edición)
    if (defaultValues) {
      // 1. Copiamos los valores originales para no mutar las props
      const formattedValues = { ...defaultValues };

      // 2. Formateamos el DUI si viene como una cadena de 9 dígitos sin guion
      const dui = defaultValues.customerDui;
      if (dui && typeof dui === 'string' && dui.length === 9 && !dui.includes('-')) {
        formattedValues.customerDui = `${dui.slice(0, 8)}-${dui.slice(8)}`;
      }

      // 3. Formateamos el Teléfono si viene como una cadena de 8 dígitos sin guion
      const phone = defaultValues.phone;
      if (phone && typeof phone === 'string' && phone.length === 8 && !phone.includes('-')) {
        formattedValues.phone = `${phone.slice(0, 4)}-${phone.slice(4)}`;
      }
      
      // 4. Transformamos los booleanos a strings para los radio buttons (como ya lo hacías)
      formattedValues.exemptFromVat = String(defaultValues.exemptFromVat);
      formattedValues.appliesWithholding = String(defaultValues.appliesWithholding);
      
      // 5. Finalmente, reiniciamos el formulario con los datos ya formateados
      reset(formattedValues);
    }
  }, [defaultValues, reset]);

  const handlePersonTypeChange = (e) => {
    const newType = e.target.value;
    setValue('personType', newType, { shouldDirty: true });
    if (newType === 'NATURAL') { setValue('customerNit', '', { shouldValidate: true }); } 
    else { setValue('customerDui', '', { shouldValidate: true }); setValue('customerLastName', '', { shouldValidate: true }); }
  };

  // --- ¡CAMBIO IMPORTANTE! ---
  // 2. Hacemos la función onSubmit asíncrona para poder usar 'await'.
  const onSubmit = async (data) => {
    // 3. MOSTRAMOS EL DIÁLOGO DE CONFIRMACIÓN
    const result = await Notifier.confirm({
      title: isEditMode ? '¿Actualizar Cliente?' : '¿Registrar Cliente?',
      text: "La información será guardada en el sistema.",
      confirmButtonText: isEditMode ? 'Sí, actualizar' : 'Sí, registrar'
    });

    // 4. Si el usuario hace clic en "Cancelar", detenemos todo.
    if (!result.isConfirmed) {
      return;
    }

    // --- El resto de la lógica se mantiene igual ---
    if (isEditMode) {
      const payload = data;
      delete payload.personType;
      onFormSubmit(payload);
    } else {
      onFormSubmit(data);
    }
  };

  // --- ¡NUEVA FUNCIÓN PARA EL BOTÓN CANCELAR! ---
  const handleCancel = async () => {
    const result = await Notifier.confirm({
      title: '¿Descartar Cambios?',
      text: 'Si cancelas, perderás toda la información que has ingresado. ¿Deseas continuar?',
      confirmButtonText: 'Sí, descartar'
    });

    if (result.isConfirmed) {
      navigate("/ventas/clientes");
    }
  };

   return (
    // CAMBIO CLAVE: Usamos formWrapper como el contenedor principal con el fondo gris
    <div className={formStyles.formWrapper}>
      <h4 className="text-center fw-bold mb-4">{isEditMode ? 'Editar Cliente' : 'Datos Cliente'}</h4>
      
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        
        {/* Caja visualmente separada para "Tipo de Persona" */}
        <div className={formStyles.personTypeBox}>
          <strong className="me-3">Tipo de Persona</strong>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" value="NATURAL" {...register('personType')} onChange={handlePersonTypeChange} id="typeNatural" disabled={isEditMode}/>
            <label className="form-check-label" htmlFor="typeNatural">Natural</label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" value="JURIDICA" {...register('personType')} onChange={handlePersonTypeChange} id="typeJuridica" disabled={isEditMode} />
            <label className="form-check-label" htmlFor="typeJuridica">Jurídica</label>
          </div>
        </div>

        {/* Grid que contiene todos los campos del formulario */}
        <div className={formStyles.formGrid}>
          
          {/* Nombre */}
          <div className={formStyles.formGroup}>
            <label htmlFor="customerName" className={formStyles.formLabel}>{personType === 'JURIDICA' ? 'Nombre o Razón Social' : 'Nombre'}</label>
            <input id="customerName" type="text" className={formStyles.formControl} {...register("customerName")} />
            {errors.customerName && <p className={formStyles.errorMessage}>{errors.customerName.message}</p>}
          </div>

          {/* Apellido (Condicional) */}
          {personType === 'NATURAL' && (
            <div className={formStyles.formGroup}>
              <label htmlFor="customerLastName" className={formStyles.formLabel}>Apellido</label>
              <input id="customerLastName" type="text" className={formStyles.formControl} {...register("customerLastName")} />
              {errors.customerLastName && <p className={formStyles.errorMessage}>{errors.customerLastName.message}</p>}
            </div>
          )}

          {/* DUI (Condicional y usando Controller para la máscara) */}
          {personType === 'NATURAL' && (
             <div className={formStyles.formGroup}>
                <label htmlFor="customerDui" className={formStyles.formLabel}>DUI</label>
                <Controller
                  name="customerDui"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <IMaskInput
                      id="customerDui"
                      mask="00000000-0"
                      // CAMBIO CLAVE: Se ha eliminado 'unmask="typed"'
                      // Ahora el valor que se maneja internamente y se pasa a la validación
                      // es "66654654-5", no "666546545".
                      placeholder="########-#"
                      className={formStyles.formControl}
                      value={value || ''}
                      onBlur={onBlur}
                      onAccept={(acceptedValue) => onChange(acceptedValue)}
                    />
                )}/>
                 {errors.customerDui && <p className={formStyles.errorMessage}>{errors.customerDui.message}</p>}
            </div>
          )}

          {/* NIT (Condicional) */}
          {personType === 'JURIDICA' && (
               <div className={formStyles.formGroup}>
                <label htmlFor="customerNit" className={formStyles.formLabel}>NIT</label>
                <Controller name="customerNit" control={control} render={({ field: { onChange, onBlur, value } }) => (
                    <IMaskInput id="customerNit" mask="0000-000000-000-0" placeholder="####-######-###-#" className={formStyles.formControl} value={value || ''} onBlur={onBlur} onAccept={(acceptedValue) => onChange(acceptedValue)} />
                )}/>
                {errors.customerNit && <p className={formStyles.errorMessage}>{errors.customerNit.message}</p>}
            </div>
          )}
          
          {/* El resto de campos siguen la misma estructura simple */}
          <div className={formStyles.formGroup}><label htmlFor="ncr" className={formStyles.formLabel}>NRC</label><input id="ncr" type="text" className={formStyles.formControl} {...register("ncr")} />{errors.ncr && <p className={formStyles.errorMessage}>{errors.ncr.message}</p>}</div>
          <div className={formStyles.formGroup}><label htmlFor="address" className={formStyles.formLabel}>Dirección</label><input id="address" type="text" className={formStyles.formControl} {...register("address")} />{errors.address && <p className={formStyles.errorMessage}>{errors.address.message}</p>}</div>
          <div className={formStyles.formGroup}><label htmlFor="email" className={formStyles.formLabel}>Correo</label><input id="email" type="email" placeholder="ejemplo@correo.com" className={formStyles.formControl} {...register("email")} />{errors.email && <p className={formStyles.errorMessage}>{errors.email.message}</p>}</div>
          
          {/* Teléfono (usando Controller para la máscara) */}
          <div className={formStyles.formGroup}>
            <label htmlFor="phone" className={formStyles.formLabel}>Teléfono</label>
             <Controller
              name="phone"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => ( // 1. Desestructuramos 'field'
                <IMaskInput
                  id="phone"
                  mask="0000-0000"
                  unmask="typed"
                  placeholder="####-####"
                  className={formStyles.formControl}
                  value={value || ''} // Aseguramos que el valor nunca sea null/undefined
                  onBlur={onBlur}
                  // 2. CLAVE: Usamos 'onAccept' para pasar el valor limpio (unmasked) al 'onChange' de react-hook-form
                  onAccept={(acceptedValue) => onChange(acceptedValue)}
                />
              )}
            />
            {errors.phone && <p className={formStyles.errorMessage}>{errors.phone.message}</p>}
          </div>

          <div className={formStyles.formGroup}><label htmlFor="businessActivity" className={formStyles.formLabel}>Actividad Comercial</label><input id="businessActivity" type="text" className={formStyles.formControl} {...register("businessActivity")} />{errors.businessActivity && <p className={formStyles.errorMessage}>{errors.businessActivity.message}</p>}</div>
          <div className={formStyles.formGroup}><label htmlFor="creditLimit" className={formStyles.formLabel}>Límite de Crédito</label><input id="creditLimit" type="number" step="0.01" className={formStyles.formControl} {...register("creditLimit")} />{errors.creditLimit && <p className={formStyles.errorMessage}>{errors.creditLimit.message}</p>}</div>
          <div className={formStyles.formGroup}><label htmlFor="creditDay" className={formStyles.formLabel}>Días de Crédito</label><input id="creditDay" type="number" className={formStyles.formControl} {...register("creditDay")} />{errors.creditDay && <p className={formStyles.errorMessage}>{errors.creditDay.message}</p>}</div>

          {/* Radios Exento de IVA */}
          <div className={formStyles.formGroup}><label className={formStyles.formLabel}>Exento de IVA</label><div><div className="form-check form-check-inline"><input className="form-check-input" type="radio" id="exemptYes" value="true" {...register("exemptFromVat")} /><label className="form-check-label" htmlFor="exemptYes">Sí</label></div><div className="form-check form-check-inline"><input className="form-check-input" type="radio" id="exemptNo" value="false" {...register("exemptFromVat")} /><label className="form-check-label" htmlFor="exemptNo">No</label></div></div>{errors.exemptFromVat && <p className={formStyles.errorMessage}>{errors.exemptFromVat.message}</p>}</div>
          
          {/* Radios Aplica Retención */}
          <div className={formStyles.formGroup}><label className={formStyles.formLabel}>Aplica retención 1%</label><div><div className="form-check form-check-inline"><input className="form-check-input" type="radio" id="withholdingYes" value="true" {...register("appliesWithholding")} /><label className="form-check-label" htmlFor="withholdingYes">Sí</label></div><div className="form-check form-check-inline"><input className="form-check-input" type="radio" id="withholdingNo" value="false" {...register("appliesWithholding")} /><label className="form-check-label" htmlFor="withholdingNo">No</label></div></div>{errors.appliesWithholding && <p className={formStyles.errorMessage}>{errors.appliesWithholding.message}</p>}</div>
        </div>
        
        {/* Fila de botones con los nuevos estilos de la maqueta */}
        <div className={formStyles.buttonRow}>
          <button type="submit" className={formStyles.registrar} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Registrar')}
          </button>
          <button type="button" onClick={handleCancel} className={formStyles.cancelar} disabled={isSubmitting}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};