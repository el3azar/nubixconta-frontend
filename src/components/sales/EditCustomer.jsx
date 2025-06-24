import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomerService } from "../../services/sales/customerService";
import styles from "../../styles/sales/NewCustomer.module.css";

const EditCustomer = () => {
  const { getCustomerById, updateCustomer } = useCustomerService();
  const navigate = useNavigate();
  const { id } = useParams();
  const [personType, setPersonType] = useState("Natural");
  const [originalData, setOriginalData] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
  } = useForm();

  const handleDuiChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 9);
    if (value.length > 8) value = value.slice(0, 8) + "-" + value.slice(8);
    setValue("customerDui", value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customer = await getCustomerById(id);
        const tipoSinTilde = customer.personType.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        setPersonType(tipoSinTilde);
        setOriginalData(customer);
        Object.entries(customer).forEach(([key, value]) => {
          setValue(key, value);
        });
      } catch (error) {
        alert("Error al cargar cliente");
        console.error("Error:", error);
      }
    };
    fetchData();
  }, [id, getCustomerById, setValue]);

  const onSubmit = async (data) => {
    if (!originalData) return;

    const clean = (val) => (typeof val === "string" ? val.trim() : val);

    const current = {
      customerName: clean(data.customerName),
      customerLastName: personType === "Natural" ? clean(data.customerLastName) : null,
      customerDui: personType === "Natural" ? clean(data.customerDui) : null,
      address: clean(data.address),
      email: clean(data.email),
      phone: clean(data.phone),
      creditDay: data.creditDay ? Number(data.creditDay) : null,
      creditLimit: data.creditLimit ? Number(data.creditLimit) : null,
      exemptFromVat: data.exemptFromVat === "true" || data.exemptFromVat === true,
      appliesWithholding: data.appliesWithholding === "true" || data.appliesWithholding === true,
      businessActivity: clean(data.businessActivity),
      personType: personType,
      ...(data.ncr && { ncr: clean(data.ncr) }),
      ...(personType === "Juridica" && data.customerNit && { customerNit: clean(data.customerNit) }),
    };

    const payload = {};
    Object.entries(current).forEach(([key, value]) => {
      if (originalData[key] !== value) {
        payload[key] = value;
      }
    });

    try {
      console.log("Payload modificado:", payload);
      await updateCustomer(id, payload);
      alert("Cliente actualizado con éxito");
      navigate("/ventas/clientes");
    } catch (error) {
      alert("Ocurrió un error al actualizar el cliente");
      console.error("Error al actualizar:", error);
    }
  };

  return (
    <div style={{ backgroundColor: "#C9C9CE", padding: "2rem", borderRadius: "10px" }}>
      <h4 className="text-center fw-bold mb-4">Editar Cliente</h4>

      <div className="d-flex justify-content-center gap-4 mb-4">
        <div>
          <label className="form-check-label me-2 fw-bold">Tipo de Persona</label>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" value="Natural" checked={personType === "Natural"} onChange={() => setPersonType("Natural")} />
            <label className="form-check-label">Natural</label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" value="Juridica" checked={personType === "Juridica"} onChange={() => setPersonType("Juridica")} />
            <label className="form-check-label">Juridica</label>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Nombre</label>
            <input type="text" className="form-control" {...register("customerName")} />
          </div>
          {personType === "Natural" && (
            <div className="col-md-6">
              <label className="form-label">Apellido</label>
              <input type="text" className="form-control" {...register("customerLastName")} />
            </div>
          )}
          {personType === "Natural" && (
            <div className="col-md-6">
              <label className="form-label">DUI</label>
              <input type="text" className="form-control" {...register("customerDui")} onChange={handleDuiChange} />
            </div>
          )}
          <div className="col-md-6">
            <label className="form-label">NRC</label>
            <input type="text" className="form-control" {...register("ncr")} />
          </div>
          {personType === "Juridica" && (
            <div className="col-md-6">
              <label className="form-label">NIT</label>
              <input type="text" className="form-control" {...register("customerNit")} />
            </div>
          )}
          <div className="col-md-6">
            <label className="form-label">Dirección</label>
            <input type="text" className="form-control" {...register("address")} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Correo Electrónico</label>
            <input type="email" className="form-control" {...register("email")} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Teléfono</label>
            <input type="text" className="form-control" {...register("phone")} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Actividad Comercial</label>
            <input type="text" className="form-control" {...register("businessActivity")} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Límite de Crédito</label>
            <input type="number" className="form-control" {...register("creditLimit")} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Días de Crédito</label>
            <input type="number" className="form-control" {...register("creditDay")} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Exento de IVA</label><br />
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" value="true" {...register("exemptFromVat")} />
              <label className="form-check-label">Sí</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" value="false" {...register("exemptFromVat")} />
              <label className="form-check-label">No</label>
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label">Aplica retención 1%</label><br />
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" value="true" {...register("appliesWithholding")} />
              <label className="form-check-label">Sí</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" value="false" {...register("appliesWithholding")} />
              <label className="form-check-label">No</label>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-center gap-5 mt-4">
          <button type="submit" className={styles.registrar}>Actualizar</button>
          <button type="button" onClick={() => navigate("/ventas/clientes")} className={styles.cancelar}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default EditCustomer;
