import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useCustomerService } from "../../services/sales/customerService";
import styles from "../../styles/sales/NewCustomer.module.css"; 

const NewCustomer = () => {
  const { createCustomer } = useCustomerService();
  const navigate = useNavigate();
  const [personType, setPersonType] = useState("Natural");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  // DUI mask
  const handleDuiChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 9);
    if (value.length > 8) value = value.slice(0, 8) + "-" + value.slice(8);
    setValue("customerDui", value);
  };

  const onSubmit = async (data) => {
    try {
       const payload = {
      userId: 1, // temporal
      customerName: data.customerName.trim(),
      customerLastName: personType === "Natural" ? data.customerLastName.trim() : null,
      customerDui: personType === "Natural" ? data.customerDui.trim() : null,
      address: data.address.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      creditDay: Number(data.creditDay),
      creditLimit: Number(data.creditLimit),
      exemptFromVat: data.exemptFromVat === "true",
      appliesWithholding: data.appliesWithholding === "true",
      businessActivity: data.businessActivity.trim(),
      personType,
      status: true,
      creationDate: new Date().toISOString(), // <-- formato ISO actual
      ...(data.ncr && { ncr: data.ncr.trim() }),
      ...(personType === "Juridica" && data.customerNit && { customerNit: data.customerNit.trim() }),
    };
console.log("Payload enviado:", payload);
      await createCustomer(payload);
      alert("Cliente registrado con éxito");
      navigate("/ventas/clientes");
    } catch (error) {
      alert("Ocurrió un error al registrar el cliente");
      console.error("Error al registrar:", error);
    }
  };

  return (
    <div style={{ backgroundColor: "#C9C9CE", padding: "2rem", borderRadius: "10px" }}>
      <h4 className="text-center fw-bold mb-4">Datos Cliente</h4>

      {/* Tipo de persona */}
      <div className="d-flex justify-content-center gap-4 mb-4">
        <div>
          <label className="form-check-label me-2 fw-bold">Tipo de Persona</label>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              value="Natural"
              checked={personType === "Natural"}
              onChange={() => setPersonType("Natural")}
            />
            <label className="form-check-label">Natural</label>
          </div>
          <div className="form-check form-check-inline">
            <input
            className="form-check-input"
            type="radio"
            value="Juridica" // SIN acento
            checked={personType === "Juridica"}
            onChange={() => setPersonType("Juridica")}
            />
            <label className="form-check-label">Juridica</label>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Nombre</label>
            <input type="text" className="form-control" {...register("customerName", { required: "Requerido" })} />
            {errors.customerName && <span className="text-danger">{errors.customerName.message}</span>}
          </div>

          {personType === "Natural" && (
            <div className="col-md-6">
              <label className="form-label">Apellido</label>
              <input type="text" className="form-control" {...register("customerLastName", { required: "Requerido" })} />
              {errors.customerLastName && <span className="text-danger">{errors.customerLastName.message}</span>}
            </div>
          )}

         {personType === "Natural" && (
            <div className="col-md-6">
                <label className="form-label text-black">DUI</label>
                <input
                type="text"
                placeholder="########-#"
                className="form-control"
                {...register("customerDui", {
                    validate: (value) => {
                    if (personType === "Natural" && !value) return "El DUI es requerido";
                    if (value && !/^\d{8}-\d$/.test(value)) return "Formato DUI inválido";
                    return true;
                    },
                })}
                onChange={handleDuiChange}
                />
                {errors.customerDui && <span className="text-danger">{errors.customerDui.message}</span>}
            </div>
            )}


          <div className="col-md-6">
            <label className="form-label">NRC</label>
            <input type="text" className="form-control" {...register("ncr")} />
          </div>

          {personType === "Juridica" && (
  <div className="col-md-6">
    <label className="form-label text-black">NIT</label>
    <input
      type="text"
      className="form-control"
      {...register("customerNit", {
        validate: (value) => {
          if (personType === "Juridica" && !value) return "El NIT es requerido";
          return true;
        },
      })}
    />
    {errors.customerNit && <span className="text-danger">{errors.customerNit.message}</span>}
  </div>
)}



          <div className="col-md-6">
            <label className="form-label">Dirección</label>
            <input type="text" className="form-control" {...register("address", { required: "Requerido" })} />
            {errors.address && <span className="text-danger">{errors.address.message}</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              placeholder="ejemplo@gmail.com"
              className="form-control"
              {...register("email", {
                required: "Requerido",
                pattern: { value: /^\S+@\S+$/i, message: "Correo inválido" },
              })}
            />
            {errors.email && <span className="text-danger">{errors.email.message}</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Teléfono</label>
            <input type="text" className="form-control" {...register("phone", { required: "Requerido" })} />
            {errors.phone && <span className="text-danger">{errors.phone.message}</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Actividad Comercial</label>
            <input type="text" className="form-control" {...register("businessActivity", { required: "Requerido" })} />
            {errors.businessActivity && <span className="text-danger">{errors.businessActivity.message}</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Límite de Crédito</label>
            <input
              type="number"
              className="form-control"
              {...register("creditLimit", { required: "Requerido", min: 0 })}
            />
            {errors.creditLimit && <span className="text-danger">{errors.creditLimit.message}</span>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Días de Crédito</label>
            <input
              type="number"
              className="form-control"
              {...register("creditDay", { required: "Requerido", min: 0 })}
            />
            {errors.creditDay && <span className="text-danger">{errors.creditDay.message}</span>}
          </div>

          {/* Exento de IVA */}
          <div className="col-md-6">
            <label className="form-label">Exento de IVA</label><br />
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" value="true" {...register("exemptFromVat", { required: true })} />
              <label className="form-check-label">Sí</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" value="false" {...register("exemptFromVat", { required: true })} />
              <label className="form-check-label">No</label>
            </div>
          </div>

          {/* Aplica retención 1% */}
          <div className="col-md-6">
            <label className="form-label">Aplica retención 1%</label><br />
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" value="true" {...register("appliesWithholding", { required: true })} />
              <label className="form-check-label">Sí</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" value="false" {...register("appliesWithholding", { required: true })} />
              <label className="form-check-label">No</label>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="d-flex justify-content-center gap-5 mt-4">
          <button type="submit" className={styles.registrar}>Registrar</button>
          <button type="button" onClick={() => navigate("/ventas/clientes")} className={styles.cancelar}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};


export default NewCustomer;
