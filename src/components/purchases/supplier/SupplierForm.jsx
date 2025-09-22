import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { IMaskInput } from 'react-imask';
import { Notifier } from '../../../utils/alertUtils';
import { supplierSchema } from '../../../schemas/supplierSchema'; // <-- CAMBIO: Importa el nuevo schema
import formStyles from '../../../styles/sales/CustomerForm.module.css'; // <-- CAMBIO: Importa los nuevos estilos

// El componente recibe las mismas props que el de Clientes para mantener la reutilización.
export const SupplierForm = ({ onFormSubmit, defaultValues, isSubmitting = false, isEditMode = false }) => {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(supplierSchema), // <-- CAMBIO: Usa el nuevo schema
    // Valores por defecto para los campos nuevos y existentes.
    defaultValues: defaultValues || {
      personType: 'NATURAL',
      exemptFromVat: 'false',
      appliesPerception: 'false', // <-- NUEVO CAMPO
    },
  });

  const personType = watch('personType');

  useEffect(() => {
    if (defaultValues) {
      const formattedValues = { ...defaultValues };

      // Lógica de formateo para DUI y Teléfono se mantiene igual
      const dui = defaultValues.supplierDui;
      if (dui && typeof dui === 'string' && dui.length === 9 && !dui.includes('-')) {
        formattedValues.supplierDui = `${dui.slice(0, 8)}-${dui.slice(8)}`;
      }

      const phone = defaultValues.phone;
      if (phone && typeof phone === 'string' && phone.length === 8 && !phone.includes('-')) {
        formattedValues.phone = `${phone.slice(0, 4)}-${phone.slice(4)}`;
      }
      
      // Lógica para convertir booleanos a strings para los radio buttons
      formattedValues.exemptFromVat = String(defaultValues.exemptFromVat);
      formattedValues.appliesPerception = String(defaultValues.appliesPerception); // <-- NUEVO CAMPO
      
      reset(formattedValues);
    }
  }, [defaultValues, reset]);

  // La lógica para manejar el cambio de tipo de persona es idéntica
  const handlePersonTypeChange = (e) => {
    const newType = e.target.value;
    setValue('personType', newType, { shouldDirty: true });
    if (newType === 'NATURAL') {
      setValue('supplierNit', '', { shouldValidate: true });
    } else {
      setValue('supplierDui', '', { shouldValidate: true });
      setValue('supplierLastName', '', { shouldValidate: true });
    }
  };

  // La lógica de confirmación y envío del formulario se mantiene
  const onSubmit = async (data) => {
    const result = await Notifier.confirm({
      title: isEditMode ? '¿Actualizar Proveedor?' : '¿Registrar Proveedor?',
      text: "La información será guardada en el sistema.",
      confirmButtonText: isEditMode ? 'Sí, actualizar' : 'Sí, registrar'
    });

    if (!result.isConfirmed) return;

    // En modo edición, el backend no permite cambiar personType, DUI, NIT o NRC.
    // El payload para actualizar se basa en SupplierUpdateDTO.
    // Creamos un payload específico para la actualización.
    if (isEditMode) {
      const {
        supplierName,
        supplierLastName,
        address,
        email,
        phone,
        creditDay,
        creditLimit,
        exemptFromVat,
        businessActivity,
        appliesPerception,
        supplierType,
      } = data;

      const payload = {
        supplierName,
        supplierLastName,
        address,
        email,
        phone,
        creditDay,
        creditLimit,
        exemptFromVat: exemptFromVat === 'true', // Convertir a booleano
        businessActivity,
        appliesPerception: appliesPerception === 'true', // Convertir a booleano
        supplierType,
      };
      
      onFormSubmit(payload);
    } else {
      // Para crear, enviamos todos los datos del formulario.
      onFormSubmit(data);
    }
  };

  const handleCancel = async () => {
    const result = await Notifier.confirm({
      title: '¿Descartar Cambios?',
      text: 'Si cancelas, perderás toda la información que has ingresado. ¿Deseas continuar?',
      confirmButtonText: 'Sí, descartar'
    });

    if (result.isConfirmed) {
      // <-- CAMBIO: Navega a la lista de proveedores
      navigate("/compras/proveedores"); 
    }
  };

  return (
    <div className={formStyles.formWrapper}>
      <h4 className="text-center fw-bold mb-4">{isEditMode ? 'Editar Proveedor' : 'Datos del Proveedor'}</h4>
      
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Tipo de Persona (sin cambios en la lógica) */}
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

        {/* CAMBIO: Todos los 'customer...' se renombran a 'supplier...' */}
        <div className={formStyles.formGrid}>
          {/* Nombre */}
          <div className={formStyles.formGroup}>
            <label htmlFor="supplierName" className={formStyles.formLabel}>{personType === 'JURIDICA' ? 'Nombre o Razón Social' : 'Nombre'}</label>
            <input id="supplierName" type="text" className={formStyles.formControl} {...register("supplierName")} />
            {errors.supplierName && <p className={formStyles.errorMessage}>{errors.supplierName.message}</p>}
          </div>

          {/* Apellido (Condicional) */}
          {personType === 'NATURAL' && (
            <div className={formStyles.formGroup}>
              <label htmlFor="supplierLastName" className={formStyles.formLabel}>Apellido</label>
              <input id="supplierLastName" type="text" className={formStyles.formControl} {...register("supplierLastName")} />
              {errors.supplierLastName && <p className={formStyles.errorMessage}>{errors.supplierLastName.message}</p>}
            </div>
          )}

          {/* DUI (Condicional) */}
          {personType === 'NATURAL' && (
             <div className={formStyles.formGroup}>
                <label htmlFor="supplierDui" className={formStyles.formLabel}>DUI</label>
                <Controller
                  name="supplierDui"
                  control={control}
                  render={({ field }) => (
                    <IMaskInput
                      {...field}
                      id="supplierDui"
                      mask="00000000-0"
                      placeholder="########-#"
                      className={formStyles.formControl}
                      onAccept={(value) => field.onChange(value)}
                      disabled={isEditMode} // No se puede editar
                    />
                )}/>
                 {errors.supplierDui && <p className={formStyles.errorMessage}>{errors.supplierDui.message}</p>}
            </div>
          )}

          {/* NIT (Condicional) */}
          {personType === 'JURIDICA' && (
               <div className={formStyles.formGroup}>
                <label htmlFor="supplierNit" className={formStyles.formLabel}>NIT</label>
                <Controller name="supplierNit" control={control} render={({ field }) => (
                    <IMaskInput {...field} id="supplierNit" mask="0000-000000-000-0" placeholder="####-######-###-#" className={formStyles.formControl} onAccept={(value) => field.onChange(value)} disabled={isEditMode} />
                )}/>
                {errors.supplierNit && <p className={formStyles.errorMessage}>{errors.supplierNit.message}</p>}
            </div>
          )}
          
          <div className={formStyles.formGroup}><label htmlFor="nrc" className={formStyles.formLabel}>NRC</label><input id="nrc" type="text" className={formStyles.formControl} {...register("nrc")} maxLength={14} disabled={isEditMode} />{errors.nrc && <p className={formStyles.errorMessage}>{errors.nrc.message}</p>}</div>
          <div className={formStyles.formGroup}><label htmlFor="address" className={formStyles.formLabel}>Dirección</label><input id="address" type="text" className={formStyles.formControl} {...register("address")} />{errors.address && <p className={formStyles.errorMessage}>{errors.address.message}</p>}</div>
          <div className={formStyles.formGroup}><label htmlFor="email" className={formStyles.formLabel}>Correo</label><input id="email" type="email" placeholder="ejemplo@correo.com" className={formStyles.formControl} {...register("email")} />{errors.email && <p className={formStyles.errorMessage}>{errors.email.message}</p>}</div>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="phone" className={formStyles.formLabel}>Teléfono</label>
             <Controller name="phone" control={control} render={({ field }) => (
                <IMaskInput {...field} id="phone" mask="0000-0000" unmask="typed" placeholder="####-####" className={formStyles.formControl} onAccept={(value) => field.onChange(value)} />
              )}/>
            {errors.phone && <p className={formStyles.errorMessage}>{errors.phone.message}</p>}
          </div>

          <div className={formStyles.formGroup}><label htmlFor="businessActivity" className={formStyles.formLabel}>Actividad Comercial</label><input id="businessActivity" type="text" className={formStyles.formControl} {...register("businessActivity")} />{errors.businessActivity && <p className={formStyles.errorMessage}>{errors.businessActivity.message}</p>}</div>
          <div className={formStyles.formGroup}><label htmlFor="creditLimit" className={formStyles.formLabel}>Límite de Crédito</label><input id="creditLimit" type="number" step="0.01" className={formStyles.formControl} {...register("creditLimit")} />{errors.creditLimit && <p className={formStyles.errorMessage}>{errors.creditLimit.message}</p>}</div>
          <div className={formStyles.formGroup}><label htmlFor="creditDay" className={formStyles.formLabel}>Días de Crédito</label><input id="creditDay" type="number" className={formStyles.formControl} {...register("creditDay")} />{errors.creditDay && <p className={formStyles.errorMessage}>{errors.creditDay.message}</p>}</div>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="supplierType" className={formStyles.formLabel}>Tipo de Proveedor</label>
            <input id="supplierType" type="text" className={formStyles.formControl} {...register("supplierType")} />
            {errors.supplierType && <p className={formStyles.errorMessage}>{errors.supplierType.message}</p>}
          </div>
          
          {/* Radios Exento de IVA */}
          <div className={formStyles.formGroup}><label className={formStyles.formLabel}>Exento de IVA</label><div><div className="form-check form-check-inline"><input className="form-check-input" type="radio" id="exemptYes" value="true" {...register("exemptFromVat")} /><label className="form-check-label" htmlFor="exemptYes">Sí</label></div><div className="form-check form-check-inline"><input className="form-check-input" type="radio" id="exemptNo" value="false" {...register("exemptFromVat")} /><label className="form-check-label" htmlFor="exemptNo">No</label></div></div>{errors.exemptFromVat && <p className={formStyles.errorMessage}>{errors.exemptFromVat.message}</p>}</div>
          
          {/* NUEVO CAMPO: Radios Aplica Percepción */}
          <div className={formStyles.formGroup}><label className={formStyles.formLabel}>Aplica percepción 1%</label><div><div className="form-check form-check-inline"><input className="form-check-input" type="radio" id="perceptionYes" value="true" {...register("appliesPerception")} /><label className="form-check-label" htmlFor="perceptionYes">Sí</label></div><div className="form-check form-check-inline"><input className="form-check-input" type="radio" id="perceptionNo" value="false" {...register("appliesPerception")} /><label className="form-check-label" htmlFor="perceptionNo">No</label></div></div>{errors.appliesPerception && <p className={formStyles.errorMessage}>{errors.appliesPerception.message}</p>}</div>
        </div>
        
        {/* Botones (sin cambios en la lógica) */}
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