import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useCompany } from './CompanyDataContext'; // Ajusta la ruta si es necesario
import { IMaskInput } from 'react-imask';
import formStyles from '../../../styles/sales/CustomerForm.module.css';
const EditCompanyView = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
 const location = useLocation();
  const empresaFromState = location.state?.company;
  const { getCompanyById, updateCompany } = useCompany(); // 📡 Traemos funciones del contexto

  // Estado del formulario
const [form, setForm] = useState({
    nombre: '',
    giro: '',
    nit: '',
    dui: '',
    direccion: '',
    nrc: '',
    tipo: 'juridica',
  });

  const [errors, setErrors] = useState({});

useEffect(() => {
  const fetchCompany = async () => {
    try {
      const company = await getCompanyById(id);
      if (!company) {
  console.error('Empresa no encontrada');
   navigate('/admin/empresas');
  return;
}
     setForm({
  nombre: company.nombre || '',
  giro: company.giro || '',
  nit: company.nit || '',
  dui: company.dui || '',
  direccion: company.direccion || '',
  nrc: company.nrc || '',
  tipo: company.tipo || 'juridica',
});
    } catch (error) {
      console.error('Error al cargar la empresa:', error);
    }
  };

  fetchCompany();
}, [id,getCompanyById]);

  // 🔁 Manejador de inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
 const handleMaskedChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };


const handleUpdate = async () => {
    const newErrors = {};
    if (form.nombre.trim() === '') newErrors.nombre = 'Campo requerido';
    if (form.giro.trim() === '') newErrors.giro = 'Campo requerido';
    if (form.direccion.trim() === '') newErrors.direccion = 'Campo requerido';
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Swal.fire({
        title: 'Advertencia',
        text: 'Revise que los datos estén correctos',
        icon: 'error',
        confirmButtonColor: '#d33',
      });
      return;
    }

    try {
      const success = await updateCompany({
        id: parseInt(id),
        companyName: form.nombre,
        turnCompany: form.giro,
        companyNit: form.tipo === 'juridica' ? form.nit : null, // Si es jurídica, usa nit; si no, null
        companyDui: form.tipo === 'natural' ? form.dui : null,// Si es natural, usa dui; si no, null
        address: form.direccion,
        companyNrc: form.nrc,
      });

      if (success) {
        Swal.fire({
          title: 'Empresa actualizada correctamente',
          icon: 'success',
          confirmButtonColor: '#28a745',
        }).then(() => {
          setErrors({});
          navigate('/admin/empresas');
        });
      } else {
        Swal.fire('Error', 'Hubo un problema al actualizar la empresa.', 'error');
      }
    } catch (error) {
      console.error('Error al actualizar la empresa:', error);
      Swal.fire('Error', 'Ocurrió un error inesperado al actualizar la empresa.', 'error');
    }
  };

  const handleCancel = () => {
    navigate('/admin/empresas');
  };

  return (
    <div className="container py-4" style={{ maxWidth: '600px' }}>
      <h4 className="text-center fw-bold mb-4">EDITAR EMPRESA</h4>

      <form className="d-flex flex-column gap-3">
     

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

       {/* Giro del negocio */}
        <div>
          <label className="form-label text-dark fw-semibold">Giro de la empresa:</label>
          <input
            type="text"
            name="giro"
            maxLength={100}
            className={`form-control ${errors.giro ? 'is-invalid' : ''}`}
            value={form.giro}
            onChange={handleChange}
          />
          {errors.giro && <div className="form-text text-danger">{errors.giro}</div>}
        </div>


        {/* NIT (solo si es jurídica) */}
        {form.tipo === 'juridica' && (
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
 {/* DUI (solo si es natural) */}
        {form.tipo === 'natural' && (
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
            className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
            value={form.direccion}
            onChange={handleChange}
          />
          {errors.direccion && <div className="form-text text-danger">{errors.direccion}</div>}
        </div>


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
          <button type="button" className={formStyles.registrar}  onClick={handleUpdate}>
            Actualizar
          </button>
          <button type="button"  className={formStyles.cancelar}  onClick={handleCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCompanyView;
