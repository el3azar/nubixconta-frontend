// Este dashboard es para las tarjetas blancas generales
//que pueden reutilizarse en diferentes modulos del sistema
// src/components/DashboardCards.jsx
import { Link } from "react-router-dom";
import styles from '../styles/dashBoardCards.module.css';

// Recibe: title (string), items (array), onCardClick (opcional)
const DashboardCards = ({ title, items, onCardClick }) => (
  <section className="text-center">
    <header>
      <h4 className="fw-bold mb-4" style={{ color: "#000" }}>{title}</h4>
    </header>
    <div className="row justify-content-center">
      {items.map(({ label, icon: Icon, to, extraInfo,image }, i) => (
        <article
          key={i}
          className="col-12 col-md-5 col-lg-5 mb-4 d-flex justify-content-center"
          aria-label={`Tarjeta ${label}`}
        >
          {/* Si hay onCardClick, es para selección (empresas); si no, Link (ventas, etc.) */}
          {onCardClick ? (
            <div
              className={`${styles.dashboardCard} d-block text-decoration-none`}
              style={{ cursor: "pointer" }}
              onClick={() => onCardClick(i)}
            >
              <div className="fw-bold mb-2">{label}</div>
              {image ? (
                <img src={image} alt={`Logo de ${label}`} className={styles.companyLogo} />
              ) : (
                Icon && <Icon size={48} />
              )}
              {/* Extra info (NIT, DUI) solo si aplica */}
              {extraInfo && (
                <div className="mb-1" style={{ fontSize: 14 }}>{extraInfo}</div>
              )}
            </div>
          ) : (
            <Link to={to} className={`${styles.dashboardCard} d-block text-decoration-none`}>
              <div className="fw-bold mb-2">{label}</div>
               {image ? (
                <img src={image} alt={`Logo de ${label}`} className={styles.companyLogo} />
              ) : (
                Icon && <Icon size={48} />
              )}
            </Link>
          )}
        </article>
      ))}
    </div>
  </section>
);

export default DashboardCards;
