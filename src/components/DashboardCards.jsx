// Este dashboard es para las tarjetas blancas generales
//que pueden reutilizarse en diferentes modulos del sistema
import { Link } from "react-router-dom";
import styles from '../styles/dashBoardCards.module.css';

// Recibe el título del dashboard y un array de items con label, icon y to (ruta)
const DashboardCards = ({ title, items }) => (
  <section className="text-center">
    <header>
      <h4 className="fw-bold mb-4" style={{ color: "#000" }}>{title}</h4>
    </header>
    <div className="row justify-content-center">
      {items.map(({ label, icon: Icon, to }, i) => (
        <article key={i}  className="col-12 col-md-5 col-lg-5 mb-4 d-flex justify-content-center"
          aria-label={`Tarjeta ${label}`}>
          <Link to={to} className={`${styles.dashboardCard} d-block text-decoration-none`}>
            <div className="fw-bold mb-2">{label}</div>
            <Icon size={48} />
          </Link>
        </article>
      ))}
    </div>
  </section>
);

export default DashboardCards;
