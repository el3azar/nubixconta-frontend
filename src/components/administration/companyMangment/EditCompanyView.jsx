import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCompany } from './CompanyDataContext'; 
import { IMaskInput } from 'react-imask';
import formStyles from '../../../styles/sales/CustomerForm.module.css';
import { Notifier } from "../../../utils/alertUtils";
import Swal from 'sweetalert2';
import { uploadImageToCloudinary } from '../../../services/administration/company/uploadImageService';
  
const EditCompanyView = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const location = useLocation();
  const empresaFromState = location.state?.company; // Podrías no necesitar esto si siempre cargas desde la API
  const { getCompanyById, updateCompany } = useCompany(); 

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
 const [imageFile, setImageFile] = useState(null);
 const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // URL para la previsualización

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

      // **Aquí es donde se establece la imagen anterior para previsualizar**
      if (company.imageUrl) {
        setImagePreviewUrl(company.imageUrl);
        console.log("URL de imagen anterior cargada:", company.imageUrl); // Para depuración
      } else {
        setImagePreviewUrl(null); // Asegúrate de que no haya una URL de previsualización si no hay imagen
        console.log("No se encontró URL de imagen anterior."); // Para depuración
      }
    } catch (error) {
      Notifier.error('Error al cargar la empresa:', error);
    }
  };

  fetchCompany();
}, [id, getCompanyById, navigate]); // Añade 'navigate' a las dependencias si se usa dentro de useEffect

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
 const handleMaskedChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

   const handleImageChange = (e) => {
   const file = e.target.files[0];
       if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file)); // Crea una URL temporal para previsualizar el nuevo archivo
     } else {
       setImageFile(null);
       // Si el usuario borra la selección de archivo, podrías querer volver a la imagen anterior
       // Para ello, podrías necesitar una referencia a la `company.imageUrl` original.
       // Por ahora, si no selecciona, la preview se mantendrá como la última establecida (ya sea la original o una nueva previa).
       // O podrías resetear a null si quieres que no se vea nada si eligen "cancelar" la selección.
       // Para este escenario, lo dejaremos como está, que es mantener la última URL.
    }
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
      Notifier.error('Hubo un problema al actualizar los datos de la empresa');
      return;
    }

    try {
     Swal.fire({
       title: 'Actualizando...',  
       text: 'Por favor, espere mientras se actualiza la información y la imagen.',
       allowOutsideClick: false,
       didOpen: () => {
         Swal.showLoading();
         }
     });

       let imageUrlToSend = imagePreviewUrl; // Por defecto, usa la URL que está en la previsualización
       if (imageFile) {
         // Si se ha seleccionado un nuevo archivo, súbelo y usa la URL resultante
         imageUrlToSend = await uploadImageToCloudinary(imageFile);
       } 
       // Si no hay imageFile y no hay imagePreviewUrl, imageUrlToSend seguirá siendo null.
       // Si no hay imageFile pero sí imagePreviewUrl (significa que es la imagen original),
       // entonces imageUrlToSend mantendrá esa URL. Esto está correcto.

       const companyData = {
         id: parseInt(id),
        companyName: form.nombre,
        turnCompany: form.giro,
        companyNit: form.tipo === 'juridica' ? form.nit : null,
        companyDui: form.tipo === 'natural' ? form.dui : null,
        address: form.direccion,
        companyNrc: form.nrc,
        imageUrl: imageUrlToSend, // Agregamos la URL de la imagen al objeto de datos
      };

      const success = await updateCompany(companyData);
      Swal.close();
      if (success) {
        Notifier.success('Empresa actualizada correctamente')
          setErrors({});
          navigate('/admin/empresas');
      } else {
        Notifier.error('Error, Hubo un problema al actualizar la empresa.');
      }
    } catch (error) {
      console.error('Error al actualizar la empresa:', error);
      Notifier.error('Error Ocurrió un error inesperado al actualizar la empresa.');
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
         {/* Campo para subir la imagen */}
         <div>
           <label className="form-label text-dark fw-semibold">Logo de la Empresa:</label>
           <input
           type="file"
           name="logo"
           className="form-control shadow-sm rounded-3 border-2"
           accept="image/*"
           onChange={handleImageChange}
          />
         </div>
   {/* Vista previa de la imagen */}
         {imagePreviewUrl && (
           <div className="text-center mt-2">
             <img
               src={imagePreviewUrl}
               alt="Vista previa del logo"
             style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover', border: '1px solid #ccc' }}
           />
         </div>
         )}        
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