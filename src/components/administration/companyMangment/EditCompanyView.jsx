import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useCompany } from './CompanyDataContext'; // Ajusta la ruta si es necesario

const EditCompanyView = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 👈 ID de la empresa a editar desde la URL

  const { getCompanyById, updateCompany } = useCompany(); // 📡 Traemos funciones del contexto

  // Estado del formulario
  const [form, setForm] = useState({
    nombre: '',
    nit: '',
    dui: '',
    nrc: '',
    tipo: 'juridica'
  });

  const [errors, setErrors] = useState({});

  // 🔄 Carga inicial: busca la empresa por ID y llena el formulario
  useEffect(() => {
    const empresa = getCompanyById(id);
    if (empresa) {
      setForm({
        nombre: empresa.nombre,
        nit: empresa.nit || '',
        dui: empresa.dui || '',
        nrc: empresa.nrc,
        tipo: empresa.tipo || 'juridica'
      });
    } else {
      Swal.fire({
        title: 'Empresa no encontrada',
        icon: 'error',
        confirmButtonColor: '#d33'
      }).then(() => navigate('/admin/empresas'));
    }
  }, [id, getCompanyById, navigate]);

  // 🔁 Manejador de inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 🔁 Cambio de tipo de persona
  const handleTipoChange = (e) => {
    const tipo = e.target.value;
    setForm(prev => ({
      ...prev,
      tipo,
      nit: '',
      dui: ''
    }));
    setErrors({});
  };

  // ✅ Validar y actualizar empresa
  const handleUpdate = () => {
    const newErrors = {};
    if (form.nombre.trim() === '') newErrors.nombre = 'Campo requerido';
    if (form.nrc.trim() === '') newErrors.nrc = 'Campo requerido';
    else if (form.nrc.length !== 8) newErrors.nrc = 'Debe tener 8 caracteres';

    if (form.tipo === 'juridica') {
      if (form.nit.trim() === '') newErrors.nit = 'Campo requerido';
      else if (form.nit.length !== 17) newErrors.nit = 'Debe tener 17 caracteres';
    }

    if (form.tipo === 'natural') {
      if (form.dui.trim() === '') newErrors.dui = 'Campo requerido';
      else if (form.dui.length !== 10) newErrors.dui = 'Debe tener 10 caracteres';
    }

    // ❌ Mostrar errores si existen
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

    // ✅ Actualizamos usando el contexto
    updateCompany({
      id: parseInt(id),
      nombre: form.nombre,
      nit: form.tipo === 'juridica' ? form.nit : '',
      dui: form.tipo === 'natural' ? form.dui : '',
      nrc: form.nrc,
      tipo: form.tipo
    });

    Swal.fire({
      title: 'Empresa actualizada correctamente',
      icon: 'success',
      confirmButtonColor: '#28a745'
    }).then(() => {
      setErrors({});
      navigate('/admin/empresas');
    });
  };

  const handleCancel = () => {
    navigate('/admin/empresas');
  };

  return (
    <div className="container py-4" style={{ maxWidth: '600px' }}>
      <h4 className="text-center fw-bold mb-4">EDITAR EMPRESA</h4>

      <form className="d-flex flex-column gap-3">
        {/* Tipo de persona */}
        <div>
          <label className="form-label text-dark fw-semibold">Tipo de persona:</label>
          <div className="d-flex gap-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="tipo"
                value="juridica"
                checked={form.tipo === 'juridica'}
                onChange={handleTipoChange}
                id="edit-juridica"
              />
              <label className="form-check-label text-dark" htmlFor="edit-juridica">
                Jurídica
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="tipo"
                value="natural"
                checked={form.tipo === 'natural'}
                onChange={handleTipoChange}
                id="edit-natural"
              />
              <label className="form-check-label text-dark" htmlFor="edit-natural">
                Natural
              </label>
            </div>
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label className="form-label text-dark fw-semibold">Nombre:</label>
          <input
            type="text"
            name="nombre"
            maxLength={100}
            className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
            value={form.nombre}
            onChange={handleChange}
          />
          {errors.nombre && <div className="form-text text-danger">{errors.nombre}</div>}
        </div>

        {/* NIT o DUI */}
        {form.tipo === 'juridica' && (
          <div>
            <label className="form-label text-dark fw-semibold">NIT:</label>
            <input
              type="text"
              name="nit"
              maxLength={17}
              className={`form-control ${errors.nit ? 'is-invalid' : ''}`}
              value={form.nit}
              onChange={handleChange}
            />
            {errors.nit && <div className="form-text text-danger">{errors.nit}</div>}
          </div>
        )}

        {form.tipo === 'natural' && (
          <div>
            <label className="form-label text-dark fw-semibold">DUI:</label>
            <input
              type="text"
              name="dui"
              maxLength={10}
              className={`form-control ${errors.dui ? 'is-invalid' : ''}`}
              value={form.dui}
              onChange={handleChange}
            />
            {errors.dui && <div className="form-text text-danger">{errors.dui}</div>}
          </div>
        )}

        {/* NRC */}
        <div>
          <label className="form-label text-dark fw-semibold">NRC:</label>
          <input
            type="text"
            name="nrc"
            maxLength={8}
            className={`form-control ${errors.nrc ? 'is-invalid' : ''}`}
            value={form.nrc}
            onChange={handleChange}
          />
          {errors.nrc && <div className="form-text text-danger">{errors.nrc}</div>}
        </div>

        {/* Botones */}
        <div className="d-flex justify-content-between mt-3">
          <button type="button" className="btn btn-dark px-4" onClick={handleUpdate}>
            Actualizar
          </button>
          <button type="button" className="btn btn-outline-dark px-4" onClick={handleCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCompanyView;
