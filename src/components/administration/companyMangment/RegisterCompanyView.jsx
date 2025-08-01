import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { registerCompany } from '../../../services/administration/company/registerCompanyService';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../companyMangment/CompanyDataContext'; 
import { IMaskInput } from 'react-imask';
import formStyles from '../../../styles/sales/CustomerForm.module.css';
const RegisterCompanyView = () => {
  const navigate = useNavigate();
  const { addCompany } = useCompany();

  // Datos del formulario
  const [form, setForm] = useState({
    nombre: '',
    giro:'',
    direccion:'',
    nit: '',
    dui: '',
    nrc: ''
  });  
  // Estado para saber si es persona jurídica o natural
  const [personType, setPersonType] = useState('juridica');
  const [errors, setErrors] = useState({});

  //  Maneja los cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

   const handleMaskedChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };
 
  const handlePersonTypeChange = (e) => {
    const selectedType = e.target.value;
    setPersonType(selectedType);

  };

  // Validación + Registro
  const handleRegister = async() => {
    const newErrors = {};
    if (form.nombre.trim() === '') newErrors.nombre = 'Este campo es obligatorio.';
    if (form.giro.trim() === '') newErrors.giro = 'Este campo es obligatorio.';
    if (form.direccion.trim() === '') newErrors.direccion = 'Este campo es obligatorio.';
    if (form.nrc.trim() === '') newErrors.nrc = 'Este campo es obligatorio.';
    else if (form.nrc.length !== 8) newErrors.nrc = 'Debe tener 8 caracteres.';

    if (personType === 'juridica') {
      if (form.nit.trim() === '') newErrors.nit = 'Este campo es obligatorio.';
      else if (form.nit.length !== 17) newErrors.nit = 'Debe tener 17 caracteres.';
    }

    if (personType === 'natural') {
      if (form.dui.trim() === '') newErrors.dui = 'Este campo es obligatorio.';
      else if (form.dui.length !== 10) newErrors.dui = 'Debe tener 10 caracteres.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Swal.fire({
        title: 'Advertencia',
        text: 'Revise que los datos estén correctos',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
      return;
    }

    try {
      // Se agrega empresa al contexto

       const companyData = {
      companyName: form.nombre,
      turnCompany: form.giro,
      address: form.direccion,
      companyNrc: form.nrc,
      tipo: personType,
      creationDate: new Date().toISOString(),
      ...(personType === 'juridica' && { companyNit: form.nit }),
      ...(personType === 'natural' && { companyDui: form.dui })
    };



      const newCompany =   await registerCompany(companyData);

    const adaptedCompany = {
      id: newCompany.id,
      nombre: newCompany.companyName,
      giro: newCompany.turnCompany || '',
      nit: newCompany.companyNit || '',
      dui: newCompany.companyDui || '',
      direccion: newCompany.address || '',
      nrc: newCompany.companyNrc,
      tipo: newCompany.companyDui ? 'natural' : 'juridica',
      asignada: newCompany.companyStatus
};

      addCompany(adaptedCompany);
      Swal.fire({
      title: 'Empresa registrada exitosamente',
      icon: 'success',
      confirmButtonColor: '#28a745'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/admin/empresas');
      }
    });
      // Limpia el formulario después del registro
      setForm({ nombre: '',giro:'',direccion:'', nit: '', dui: '', nrc: '' });
      setPersonType('juridica');
      setErrors({});
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  };

  // Redirección al presionar "Cancelar"
  const handleCancel = () => {
    navigate('/admin/empresas');
  };

  return (
    <div className="container py-4" style={{ maxWidth: '600px' }}>
      <h4 className="text-center fw-bold mb-4">REGISTRAR EMPRESA</h4>

      <form className="d-flex flex-column gap-3">
        {/* Tipo de persona */}
        <div>
          <label className="form-label text-dark fw-semibold">Tipo de persona:</label>
          <div className="d-flex gap-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="personType"
                value="juridica"
                checked={personType === 'juridica'}
                onChange={handlePersonTypeChange}
                id="juridica"
              />
              <label className="form-check-label text-dark" htmlFor="juridica">Jurídica</label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="personType"
                value="natural"
                checked={personType === 'natural'}
                onChange={handlePersonTypeChange}
                id="natural"
              />
              <label className="form-check-label text-dark" htmlFor="natural">Natural</label>
            </div>
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label className="form-label text-dark fw-semibold">Nombre de persona Jurídica o Natural:</label>
          <input
            type="text"
            name="nombre"
            maxLength={100}
            className={`form-control shadow-sm rounded-3 border-2 ${errors.nombre ? 'is-invalid' : ''}`}
            value={form.nombre}
            onChange={handleChange}
          />
          {errors.nombre && <div className="form-text text-danger">{errors.nombre}</div>}
        </div>
                {/* Giro de la empresa */}
        <div>
          <label className="form-label text-dark fw-semibold">Giro de la empresa:</label>
          <input
            type="text"
            name="giro"
            maxLength={100}
            className={`form-control shadow-sm rounded-3 border-2 ${errors.nombre ? 'is-invalid' : ''}`}
            value={form.giro}
            onChange={handleChange}
          />
          {errors.giro && <div className="form-text text-danger">{errors.giro}</div>}
        </div>


        {/* NIT o DUI */}
        {personType === 'juridica' && (
          <div>
            <label className="form-label text-dark fw-semibold">NIT:</label>
            <IMaskInput
              mask="0000-000000-000-0" // Máscara para NIT: ####-######-###-#
              placeholder="####-######-###-#"
              name="nit"
              className={`form-control shadow-sm rounded-3 border-2 ${errors.nit ? 'is-invalid' : ''}`}
              value={form.nit}
              onAccept={(value) => handleMaskedChange('nit', value)} // Usa handleMaskedChange
              // onBlur es útil para activar validaciones al salir del campo
              onBlur={() => setErrors(prev => ({ ...prev, nit: form.nit.length === 17 ? '' : 'Debe tener 17 caracteres (formato ####-######-###-#).' }))}
            />
            {errors.nit && <div className="form-text text-danger">{errors.nit}</div>}
          </div>
        )}

      {personType === 'natural' && (
          <div>
            <label className="form-label text-dark fw-semibold">DUI:</label>
            <IMaskInput
              mask="00000000-0" // Máscara para DUI: ########-#
              placeholder="########-#"
              name="dui"
              className={`form-control shadow-sm rounded-3 border-2 ${errors.dui ? 'is-invalid' : ''}`}
              value={form.dui}
              onAccept={(value) => handleMaskedChange('dui', value)} // Usa handleMaskedChange
              // onBlur es útil para activar validaciones al salir del campo
              onBlur={() => setErrors(prev => ({ ...prev, dui: form.dui.length === 10 ? '' : 'Debe tener 10 caracteres (formato ########-#).' }))}
            />
            {errors.dui && <div className="form-text text-danger">{errors.dui}</div>}
          </div>
        )}

           {/* direccion */}
        <div>
          <label className="form-label text-dark fw-semibold">Dirección:</label>
          <input
            type="text"
            name="direccion"
            maxLength={100}
            className={`form-control shadow-sm rounded-3 border-2 ${errors.nombre ? 'is-invalid' : ''}`}
            value={form.direccion}
            onChange={handleChange}
          />
          {errors.direccion && <div className="form-text text-danger">{errors.direccion}</div>}
        </div>

        {/* NRC */}
        <div>
          <label className="form-label text-dark fw-semibold">Número de registro de contribuyente (NRC):</label>
          <input
            type="text"
            name="nrc"
            maxLength={8}
            className={`form-control shadow-sm rounded-3 border-2 ${errors.nrc ? 'is-invalid' : ''}`}
            value={form.nrc}
            onChange={handleChange}
          />
          {errors.nrc && <div className="form-text text-danger">{errors.nrc}</div>}
        </div>

        {/* Botones */}
        <div className="d-flex justify-content-between mt-3">
          <button type="button" className={formStyles.registrar} onClick={handleRegister} >
            Registrar
          </button>
          <button type="button" className={formStyles.cancelar}  onClick={handleCancel} >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterCompanyView;
