// src/components/shared/form/EntityForm.jsx

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { IMaskInput } from 'react-imask';
import { Notifier } from '../../../utils/alertUtils';
import formStyles from '../../../styles/shared/EntityForm.module.css'; // Usamos el CSS original como base

export const EntityForm = ({ entityType, config, onFormSubmit, defaultValues, isSubmitting = false, isEditMode = false }) => {
  const navigate = useNavigate();
  
  // SOLUCIÓN DEFINITIVA: Los valores por defecto se definen aquí,
  // asegurando que solo los campos relevantes para la entidad actual existan.
  const getInitialValues = () => {
    const commonValues = {
      [config.nameField]: '',
      [config.lastNameField]: '',
      [config.duiField]: '',
      [config.nitField]: '',
      [config.nrcField]: '',
      address: '',
      email: '',
      phone: '',
      businessActivity: '',
      creditLimit: 0,
      creditDay: 0,
      personType: 'NATURAL',
      exemptFromVat: 'false',
    };
    if (entityType === 'supplier') {
      return { ...commonValues, appliesPerception: 'false', supplierType: '' };
    }
    // Para cliente
    return { ...commonValues, appliesWithholding: 'false' };
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(config.schema),
    // Esto asegura que al crear, se usen los valores por defecto correctos
    // Y al editar, se usen los valores que vienen del backend.
    defaultValues: defaultValues || getInitialValues(),
  });
  
  // El console.log es útil para depurar
  console.log('ERRORES DE VALIDACIÓN:', errors);
  
  const personType = watch('personType');

  useEffect(() => {
    if (defaultValues) {
      const formattedValues = { ...defaultValues };
      const dui = formattedValues[config.duiField];
      if (dui && typeof dui === 'string' && dui.length === 9 && !dui.includes('-')) {
        formattedValues[config.duiField] = `${dui.slice(0, 8)}-${dui.slice(8)}`;
      }
      const phone = formattedValues[config.phoneField];
      if (phone && typeof phone === 'string' && phone.length === 8 && !phone.includes('-')) {
        formattedValues[config.phoneField] = `${phone.slice(0, 4)}-${phone.slice(4)}`;
      }
      formattedValues.exemptFromVat = String(defaultValues.exemptFromVat);
      if (entityType === 'supplier') {
        formattedValues.appliesPerception = String(defaultValues.appliesPerception);
      } else {
        formattedValues.appliesWithholding = String(defaultValues.appliesWithholding);
      }
      reset(formattedValues);
    }
  }, [defaultValues, reset, config, entityType]);

  const handlePersonTypeChange = (e) => {
    const newType = e.target.value;
    setValue('personType', newType, { shouldDirty: true });
    if (newType === 'NATURAL') {
      setValue(config.nitField, '', { shouldValidate: true });
    } else {
      setValue(config.duiField, '', { shouldValidate: true });
      setValue(config.lastNameField, '', { shouldValidate: true });
    }
  };

  const onSubmit = async (data) => {
    const result = await Notifier.confirm({
      title: isEditMode ? `¿Actualizar ${config.entityName}?` : `¿Registrar ${config.entityName}?`,
      text: "La información será guardada en el sistema.",
      confirmButtonText: isEditMode ? 'Sí, actualizar' : 'Sí, registrar'
    });
    if (!result.isConfirmed) return;
    onFormSubmit(data);
  };

  const handleCancel = async () => {
    const result = await Notifier.confirm({
      title: '¿Descartar Cambios?',
      text: 'Si cancelas, perderás toda la información que has ingresado.',
      confirmButtonText: 'Sí, descartar'
    });
    if (result.isConfirmed) {
      navigate(config.basePath);
    }
  };

  return (
    <div className={formStyles.formWrapper}>
      <h4 className="text-center fw-bold mb-4">{isEditMode ? `Editar ${config.entityName}` : `Datos del ${config.entityName}`}</h4>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Este JSX es una réplica fiel del original de CustomerForm */}
        <div className={formStyles.personTypeBox}>
          <strong className="me-3">Tipo de Persona</strong>
          <div className="form-check form-check-inline"><input className="form-check-input" type="radio" value="NATURAL" {...register('personType')} onChange={handlePersonTypeChange} id="typeNatural" disabled={isEditMode}/><label className="form-check-label" htmlFor="typeNatural">Natural</label></div>
          <div className="form-check form-check-inline"><input className="form-check-input" type="radio" value="JURIDICA" {...register('personType')} onChange={handlePersonTypeChange} id="typeJuridica" disabled={isEditMode} /><label className="form-check-label" htmlFor="typeJuridica">Jurídica</label></div>
        </div>

        <div className={formStyles.formGrid}>
          <div className={formStyles.formGroup}><label className={formStyles.formLabel}>{personType === 'JURIDICA' ? 'Nombre o Razón Social' : 'Nombre'}</label><input id={config.nameField} type="text" className={formStyles.formControl} {...register(config.nameField)} />{errors[config.nameField] && <p className={formStyles.errorMessage}>{errors[config.nameField].message}</p>}</div>
          {personType === 'NATURAL' && (<div className={formStyles.formGroup}><label htmlFor={config.lastNameField} className={formStyles.formLabel}>Apellido</label><input id={config.lastNameField} type="text" className={formStyles.formControl} {...register(config.lastNameField)} />{errors[config.lastNameField] && <p className={formStyles.errorMessage}>{errors[config.lastNameField].message}</p>}</div>)}
          {personType === 'NATURAL' && (<div className={formStyles.formGroup}><label htmlFor={config.duiField} className={formStyles.formLabel}>DUI</label><Controller name={config.duiField} control={control} render={({ field }) => (<IMaskInput {...field} id={config.duiField} mask="00000000-0" placeholder="########-#" className={formStyles.formControl} onAccept={(v) => field.onChange(v)} disabled={isEditMode} />)}/>{errors[config.duiField] && <p className={formStyles.errorMessage}>{errors[config.duiField].message}</p>}</div>)}
          {personType === 'JURIDICA' && (<div className={formStyles.formGroup}><label htmlFor={config.nitField} className={formStyles.formLabel}>NIT</label><Controller name={config.nitField} control={control} render={({ field }) => (<IMaskInput {...field} id={config.nitField} mask="0000-000000-000-0" placeholder="####-######-###-#" className={formStyles.formControl} onAccept={(v) => field.onChange(v)} disabled={isEditMode} />)}/>{errors[config.nitField] && <p className={formStyles.errorMessage}>{errors[config.nitField].message}</p>}</div>)}
          <div className={formStyles.formGroup}><label htmlFor={config.nrcField} className={formStyles.formLabel}>NRC</label><input id={config.nrcField} type="text" className={formStyles.formControl} {...register(config.nrcField)} maxLength={14} disabled={isEditMode}/>{errors[config.nrcField] && <p className={formStyles.errorMessage}>{errors[config.nrcField].message}</p>}</div>
          <div className={formStyles.formGroup}><label htmlFor="address" className={formStyles.formLabel}>Dirección</label><input id="address" type="text" className={formStyles.formControl} {...register("address")} />{errors.address && <p className={formStyles.errorMessage}>{errors.address.message}</p>}</div>
          <div className={formStyles.formGroup}><label htmlFor="email" className={formStyles.formLabel}>Correo</label><input id="email" type="email" placeholder="ejemplo@correo.com" className={formStyles.formControl} {...register("email")} />{errors.email && <p className={formStyles.errorMessage}>{errors.email.message}</p>}</div>
           <div className={formStyles.formGroup}>
                <label htmlFor="phone" className={formStyles.formLabel}>Teléfono</label>
                <Controller
                    name="phone"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <IMaskInput
                            id="phone"
                            mask="0000-0000"
                            unmask="typed"
                            placeholder="####-####"
                            className={formStyles.formControl}
                            value={value || ''}
                            onBlur={onBlur}
                            onAccept={(acceptedValue) => onChange(acceptedValue)}
                        />
                    )}
                />
                {errors.phone && <p className={formStyles.errorMessage}>{errors.phone.message}</p>}
            </div>
          <div className={formStyles.formGroup}><label htmlFor="businessActivity" className={formStyles.formLabel}>Actividad Comercial</label><input id="businessActivity" type="text" className={formStyles.formControl} {...register("businessActivity")} />{errors.businessActivity && <p className={formStyles.errorMessage}>{errors.businessActivity.message}</p>}</div>
          <div className={formStyles.formGroup}><label htmlFor="creditLimit" className={formStyles.formLabel}>Límite de Crédito</label><input id="creditLimit" type="number" step="0.01" className={formStyles.formControl} {...register("creditLimit")} />{errors.creditLimit && <p className={formStyles.errorMessage}>{errors.creditLimit.message}</p>}</div>
          <div className={formStyles.formGroup}><label htmlFor="creditDay" className={formStyles.formLabel}>Días de Crédito</label><input id="creditDay" type="number" className={formStyles.formControl} {...register("creditDay")} />{errors.creditDay && <p className={formStyles.errorMessage}>{errors.creditDay.message}</p>}</div>
          <div className={formStyles.formGroup}><label className={formStyles.formLabel}>Exento de IVA</label><div><div className="form-check form-check-inline"><input className="form-check-input" type="radio" id="exemptYes" value="true" {...register("exemptFromVat")} /><label className="form-check-label" htmlFor="exemptYes">Sí</label></div><div className="form-check form-check-inline"><input className="form-check-input" type="radio" id="exemptNo" value="false" {...register("exemptFromVat")} /><label className="form-check-label" htmlFor="exemptNo">No</label></div></div>{errors.exemptFromVat && <p className={formStyles.errorMessage}>{errors.exemptFromVat.message}</p>}</div>
          {entityType === 'supplier' && (<>
            <div className={formStyles.formGroup}><label htmlFor="supplierType" className={formStyles.formLabel}>Tipo de Proveedor</label><input id="supplierType" type="text" className={formStyles.formControl} {...register("supplierType")} />{errors.supplierType && <p className={formStyles.errorMessage}>{errors.supplierType.message}</p>}</div>
            <div className={formStyles.formGroup}><label className={formStyles.formLabel}>Aplica percepción 1%</label><div><div className="form-check form-check-inline"><input className="form-check-input" type="radio" id="perceptionYes" value="true" {...register("appliesPerception")} /><label className="form-check-label" htmlFor="perceptionYes">Sí</label></div><div className="form-check form-check-inline"><input className="form-check-input" type="radio" id="perceptionNo" value="false" {...register("appliesPerception")} /><label className="form-check-label" htmlFor="perceptionNo">No</label></div></div>{errors.appliesPerception && <p className={formStyles.errorMessage}>{errors.appliesPerception.message}</p>}</div>
          </>)}
          {entityType === 'customer' && (<div className={formStyles.formGroup}><label className={formStyles.formLabel}>Aplica retención 1%</label><div><div className="form-check form-check-inline"><input className="form-check-input" type="radio" id="withholdingYes" value="true" {...register("appliesWithholding")} /><label className="form-check-label" htmlFor="withholdingYes">Sí</label></div><div className="form-check form-check-inline"><input className="form-check-input" type="radio" id="withholdingNo" value="false" {...register("appliesWithholding")} /><label className="form-check-label" htmlFor="withholdingNo">No</label></div></div>{errors.appliesWithholding && <p className={formStyles.errorMessage}>{errors.appliesWithholding.message}</p>}</div>)}
        </div>
        
        <div className={formStyles.buttonRow}>
          <button type="submit" className={formStyles.registrar} disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Registrar')}</button>
          <button type="button" onClick={handleCancel} className={formStyles.cancelar} disabled={isSubmitting}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};