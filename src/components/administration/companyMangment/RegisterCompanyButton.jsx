import { Link} from 'react-router-dom';
import { FaEyeSlash, FaPlusCircle } from 'react-icons/fa';
import styles from "../../../styles/sales/ViewCustomers.module.css";
const RegisterCompanyButton = () => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <h5 className="fw-bold mb-3 mb-md-0" style={{ color: '#10031C' }}>Empresas:</h5>
          <div className="d-flex gap-3 ">
            <Link to="/admin/empresas/registronuevo"  className={styles.actionButton}><FaPlusCircle className="me-2" /> Nueva</Link>
            <Link to="/admin/empresas/desactivadas"  className={styles.actionButton}><FaEyeSlash className="me-2" /> Desactivadas</Link>
          </div>
        </div>
  );
};

export default RegisterCompanyButton;
