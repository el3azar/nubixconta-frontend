import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useCompany } from './CompanyDataContext'; // Ruta según tu estructura

const RegisterCompanyView = () => {
  const navigate = useNavigate();
  const { addCompany } = useCompany(); // 🚀 Trae la función para agregar empresas

  // Estado para saber si es persona jurídica o natural
  const [personType, setPersonType] = useState('juridica');

  // Datos del formulario
  const [form, setForm] = useState({
    nombre: '',
    nit: '',
    dui: '',
    nrc: ''
  });

  // Estado para errores de validación
  const [errors, setErrors] = useState({});

  // 🔄 Maneja los cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 🧠 Cambia el tipo de persona y limpia campos correspondientes
  const handlePersonTypeChange = (e) => {
    const value = e.target.value;
    setPersonType(value);
    setForm(prev => ({ ...prev, nit: '', dui: '' }));
    setErrors(prev => ({ ...prev, nit: undefined, dui: undefined }));
  };

  // ✅ Validación + Registro
  const handleRegister = () => {
    const newErrors = {};

    if (form.nombre.trim() === '') newErrors.nombre = 'Este campo es obligatorio.';
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

    // ⚠️ Si hay errores, mostramos alerta
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
      // 💾 Agregamos empresa al contexto
      addCompany({
        nombre: form.nombre,
        nit: personType === 'juridica' ? form.nit : '',
        dui: personType === 'natural' ? form.dui : '',
        nrc: form.nrc,
        tipo: personType,
        asignada: false,
        activa: true
      });

      Swal.fire({
        title: 'Empresa registrada exitosamente',
        icon: 'success',
        confirmButtonColor: '#28a745'
      });

      // 🔁 Limpia el formulario después del registro
      setForm({ nombre: '', nit: '', dui: '', nrc: '' });
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

  // 🔙 Redirección al presionar "Cancelar"
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

        {/* NIT o DUI */}
        {personType === 'juridica' && (
          <div>
            <label className="form-label text-dark fw-semibold">NIT:</label>
            <input
              type="text"
              name="nit"
              maxLength={17}
              className={`form-control shadow-sm rounded-3 border-2 ${errors.nit ? 'is-invalid' : ''}`}
              value={form.nit}
              onChange={handleChange}
            />
            {errors.nit && <div className="form-text text-danger">{errors.nit}</div>}
          </div>
        )}

        {personType === 'natural' && (
          <div>
            <label className="form-label text-dark fw-semibold">DUI:</label>
            <input
              type="text"
              name="dui"
              maxLength={10}
              className={`form-control shadow-sm rounded-3 border-2 ${errors.dui ? 'is-invalid' : ''}`}
              value={form.dui}
              onChange={handleChange}
            />
            {errors.dui && <div className="form-text text-danger">{errors.dui}</div>}
          </div>
        )}

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
          <button type="button" className="btn btn-dark px-4" onClick={handleRegister}>
            Registrar
          </button>
          <button type="button" className="btn btn-outline-dark px-4" onClick={handleCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterCompanyView;
