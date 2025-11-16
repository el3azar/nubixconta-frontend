// src/components/accounting/CierresContables.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCierreService } from '../../services/accounting/cierreService';
import { Notifier } from '../../utils/alertUtils';
import { Spinner } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { accountingSubMenuLinks } from '../../config/menuConfig';
import SubMenu from '../shared/SubMenu';
import ViewContainer from '../shared/ViewContainer';
import styles from '../../styles/accounting/CierresContables.module.css';

const CierresContables = () => {
    const queryClient = useQueryClient();
    const { getEstadoMensualPorAnio, cerrarPeriodo, reabrirPeriodo } = useCierreService();
    
    // --- INICIO DE LA CORRECCIÓN ---
    // 1. Obtenemos el año actual del sistema.
    const systemYear = new Date().getFullYear();
    const [currentYear, setCurrentYear] = useState(systemYear);
    // --- FIN DE LA CORRECCIÓN ---

    const queryKey = ['cierres', currentYear];

    const { data: estadosMensuales = [], isLoading } = useQuery({
        queryKey: queryKey,
        queryFn: () => getEstadoMensualPorAnio(currentYear),
    });

    const { mutate: cerrarMutate, isPending: isClosing } = useMutation({
        mutationFn: cerrarPeriodo,
        onSuccess: () => {
            Notifier.success("Período cerrado exitosamente.");
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error) => Notifier.error(error.response?.data?.message || "No se pudo cerrar el período."),
    });

    const { mutate: reabrirMutate, isPending: isReopening } = useMutation({
        mutationFn: reabrirPeriodo,
        onSuccess: () => {
            Notifier.success("Período reabierto exitosamente.");
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error) => Notifier.error(error.response?.data?.message || "No se pudo reabrir el período."),
    });

    const handleCerrar = async (mes, nombreMes) => {
        const result = await Notifier.confirm({
            title: `¿Cerrar ${nombreMes} ${currentYear}?`,
            text: "Una vez cerrado, no se podrán registrar ni modificar transacciones en este período.",
            confirmButtonText: "Sí, cerrar"
        });
        if (result.isConfirmed) {
            cerrarMutate({ anio: currentYear, mes });
        }
    };

    const handleReabrir = async (mes, nombreMes) => {
        const result = await Notifier.confirm({
            title: `¿Reabrir ${nombreMes} ${currentYear}?`,
            text: "Se permitirán nuevamente transacciones en este período. Esta acción debe usarse con precaución.",
            confirmButtonText: "Sí, reabrir"
        });
        if (result.isConfirmed) {
            reabrirMutate({ anio: currentYear, mes });
        }
    };

    return (
        <>
            <SubMenu links={accountingSubMenuLinks} />
            <ViewContainer title="Gestión de Cierres Contables">
                <div className={styles.container}>
                    <header className={styles.header}>
                        <h2 className={styles.title}>Períodos Contables</h2>
                        <div className={styles.yearSelector}>
                            <button onClick={() => setCurrentYear(y => y - 1)}><FaChevronLeft /></button>
                            <span className={styles.yearDisplay}>{currentYear}</span>
                            {/* --- INICIO DE LA CORRECCIÓN --- */}
                            {/* 2. Se añade la condición `disabled` al botón "siguiente". */}
                            <button 
                                onClick={() => setCurrentYear(y => y + 1)} 
                                disabled={currentYear >= systemYear}
                            >
                                <FaChevronRight />
                            </button>
                            {/* --- FIN DE LA CORRECCIÓN --- */}
                        </div>
                    </header>

                    {isLoading ? (
                        <div className="text-center p-5"><Spinner /></div>
                    ) : (
                        <ul className={styles.monthList}>
                            {estadosMensuales.map((mesInfo) => {
                                const { mes, nombreMes, cerrado } = mesInfo;
                                const isActionPending = isClosing || isReopening;

                                return (
                                    <li key={mes} className={styles.monthItem}>
                                        <span className={styles.monthName}>{nombreMes}</span>
                                        <span className={`${styles.status} ${cerrado ? styles.statusClosed : styles.statusOpen}`}>
                                            {cerrado ? "Cerrado" : "Abierto"}
                                        </span>
                                        <div>
                                            {cerrado ? (
                                                <button
                                                    className={`${styles.actionButton} ${styles.reopenButton}`}
                                                    onClick={() => handleReabrir(mes, nombreMes)}
                                                    disabled={isActionPending}
                                                >
                                                    Reabrir Período
                                                </button>
                                            ) : (
                                                <button
                                                    className={`${styles.actionButton} ${styles.closeButton}`}
                                                    onClick={() => handleCerrar(mes, nombreMes)}
                                                    disabled={isActionPending}
                                                >
                                                    Cerrar Período
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </ViewContainer>
        </>
    );
};

export default CierresContables;