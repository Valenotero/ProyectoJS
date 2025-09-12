'use strict';

// Manejo global de errores para evitar errores de extensiones
window.addEventListener('error', (event) => {
    if (
        event.error &&
        event.error.message &&
        (event.error.message.includes('message channel closed') ||
            event.error.message.includes('runtime.lastError'))
    ) {
        event.preventDefault();
        return false;
    }
});

window.addEventListener('unhandledrejection', (event) => {
    if (
        event.reason &&
        event.reason.message &&
        (event.reason.message.includes('message channel closed') ||
            event.reason.message.includes('runtime.lastError'))
    ) {
        event.preventDefault();
        return false;
    }
});

// ===================== CLASE PRINCIPAL =====================
class GestorPresupuesto {
    constructor() {
        // Inicializar arrays para almacenar transacciones
        this.ingresos = [];
        this.gastos = [];

        // Inicializar gráficos
        this.chart = null;
        this.additionalCharts = {};

        // Propiedades para el sistema de fechas y períodos
        this.currentPeriod = {
            type: 'month',
            start: null,
            end: null,
        };
        this.currentCalendarDate = new Date();

        // Propiedades para páginas separadas
        this.currentPage = this.detectCurrentPage();
        this.transactionFilters = {
            search: '',
            type: 'all',
            category: 'all',
            sortBy: 'date-desc',
        };
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 20,
            totalItems: 0,
        };

        // Verificar que el DOM esté listo antes de continuar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.inicializarAplicacion();
            });
        } else {
            this.inicializarAplicacion();
        }
        this.calendarViewMode = 'month'; // 'month' | 'year'
        this.yearRange = { start: new Date().getFullYear() - 5, end: new Date().getFullYear() + 5 };
    }

    // Detectar página actual
    detectCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('dashboard.html')) return 'dashboard';
        if (path.includes('transacciones.html')) return 'transacciones';
        if (path.includes('calendario.html')) return 'calendario';
        if (path.includes('analisis.html')) return 'analisis';
        return 'index';
    }

    // Método para inicializar la aplicación de manera segura
    inicializarAplicacion() {
        try {
            this.cargarDatos();
            this.inicializar();
        } catch (error) {
            this.mostrarErrorInicializacion();
        }
    }

    // Método para inicializar la aplicación
    inicializar() {
        try {
            this.configurarEventosBasicos();
            this.configurarFechasPorDefecto();

            // Inicializar según la página
            switch (this.currentPage) {
                case 'index':
                    this.inicializarIndex();
                    break;
                case 'dashboard':
                    this.inicializarDashboard();
                    break;
                case 'transacciones':
                    this.inicializarTransacciones();
                    break;
                case 'calendario':
                    this.inicializarCalendario();
                    break;
                case 'analisis':
                    this.inicializarAnalisis();
                    break;
            }

            this.mostrarMensajeBienvenida();
        } catch (error) {
            console.error('Error en inicialización:', error);
        }
    }

    // ============ INICIALIZADORES POR PÁGINA ============
    inicializarIndex() {
        try {
            this.configurarTabs();
            this.configurarPeriodos();
            this.configurarCalendario();
            this.mostrarResumenInicio();
            this.actualizarResumen();
            this.renderizarTransacciones();
            this.inicializarGrafico();
        } catch (error) {
            console.error('Error inicializando index:', error);
        }
    }

    inicializarDashboard() {
        try {
            this.configurarPeriodos();
            this.actualizarResumen();
            this.inicializarGrafico();
            this.actualizarGraficoTendencia();
            this.mostrarTransaccionesRecientes();
        } catch (error) {
            console.error('Error inicializando dashboard:', error);
        }
    }

    inicializarTransacciones() {
        try {
            this.configurarPeriodos();
            this.configurarFiltrosTransacciones();
            this.configurarPaginacion();
            this.actualizarListaTransacciones();
            this.actualizarFiltrosCategorias();
        } catch (error) {
            console.error('Error inicializando transacciones:', error);
        }
    }

    inicializarCalendario() {
        try {
            this.actualizarResumenMes();
            this.actualizarCalendario();
            this.configurarDetallesDia();
            this.actualizarEstadisticasMensuales();
        } catch (error) {
            console.error('Error inicializando calendario:', error);
        }
    }

    inicializarAnalisis() {
        try {
            this.configurarPeriodos();
            this.actualizarEstadisticasGenerales();
            this.actualizarGraficosAnalisis();
            this.actualizarPatrones();
            this.actualizarComparativas();
            this.generarInsights();
        } catch (error) {
            console.error('Error inicializando análisis:', error);
        }
    }

    // ============ CONFIGURACIÓN DE EVENTOS ============
    configurarEventosBasicos() {
        try {
            // Eventos para formularios (si existen en la página)
            const incomeForm = document.getElementById('income-form');
            const expenseForm = document.getElementById('expense-form');
            const clearAllBtn = document.getElementById('clear-all-btn');

            if (incomeForm) {
                incomeForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.agregarIngreso();
                });
            }

            if (expenseForm) {
                expenseForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.agregarGasto();
                });
            }

            if (clearAllBtn) {
                clearAllBtn.addEventListener('click', () => {
                    this.limpiarTodo();
                });
            }

            // Botón de prueba del gráfico
            const testChartBtn = document.getElementById('test-chart-btn');
            if (testChartBtn) {
                testChartBtn.addEventListener('click', () => {
                    this.probarGrafico();
                });
            }

            // Botones de exportar/importar
            const exportBtn = document.getElementById('export-btn');
            const importBtn = document.getElementById('import-btn');
            const importFile = document.getElementById('import-file');

            if (exportBtn) {
                exportBtn.addEventListener('click', () => this.exportarDatos());
            }

            if (importBtn) {
                importBtn.addEventListener('click', () =>
                    document.getElementById('import-file')?.click()
                );
            }

            if (importFile) {
                importFile.addEventListener('change', (e) =>
                    this.manejarImportarArchivo(e)
                );
            }

            // Validación de inputs
            this.configurarValidacionInputs();
        } catch (error) {
            console.error('Error configurando eventos básicos:', error);
        }
    }

    configurarTabs() {
        try {
            document.querySelectorAll('.nav-tab[data-tab]').forEach((tab) => {
                tab.addEventListener('click', (e) => {
                    const tabName = e.target.closest('.nav-tab').dataset.tab;
                    this.cambiarTab(tabName);
                });
            });
        } catch (error) {
            console.error('Error configurando tabs:', error);
        }
    }

    configurarPeriodos() {
        try {
            const periodSelect = document.getElementById('period-type');
            const applyBtn = document.getElementById('apply-period');

            if (periodSelect) {
                periodSelect.addEventListener('change', (e) => {
                    this.manejarCambioPeriodo(e.target.value);
                });
            }

            if (applyBtn) {
                applyBtn.addEventListener('click', () => {
                    this.aplicarPeriodoPersonalizado();
                });
            }

            this.actualizarPeriodo();
        } catch (error) {
            console.error('Error configurando períodos:', error);
        }
    }

    configurarCalendario() {
        try {
            const prevBtn = document.getElementById('prev-month');
            const nextBtn = document.getElementById('next-month');
            const todayBtn = document.getElementById('today-btn');

            const viewMode = document.getElementById('calendar-view-mode'); // select: month|year
            const yearSelect = document.getElementById('year-select');
            const monthSelect = document.getElementById('month-select');
            const daySelect = document.getElementById('day-select');
            const gotoBtn = document.getElementById('go-to-date');

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    if (this.calendarViewMode === 'year') {
                        this.currentCalendarDate.setFullYear(this.currentCalendarDate.getFullYear() - 1);
                    } else {
                        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + -1);
                    }
                    this.actualizarCalendario();
                    this.actualizarResumenMes();
                    this.actualizarSelectoresFecha();
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    if (this.calendarViewMode === 'year') {
                        this.currentCalendarDate.setFullYear(this.currentCalendarDate.getFullYear() + 1);
                    } else {
                        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
                    }
                    this.actualizarCalendario();
                    this.actualizarResumenMes();
                    this.actualizarSelectoresFecha();
                });
            }

            if (todayBtn) {
                todayBtn.addEventListener('click', () => {
                    this.currentCalendarDate = new Date();
                    this.actualizarCalendario();
                    this.actualizarResumenMes();
                    this.actualizarSelectoresFecha();
                });
            }

            if (viewMode) {
                viewMode.addEventListener('change', (e) => {
                    this.calendarViewMode = e.target.value;
                    this.actualizarCalendario();
                    // En vista anual no mostramos resumen mensual (opcional)
                    if (this.calendarViewMode === 'month') this.actualizarResumenMes();
                });
            }

            // Selectores de fecha
            if (yearSelect && monthSelect && daySelect) {
                // Inicializa opciones
                this.inicializarSelectoresFecha();

                monthSelect.addEventListener('change', () => this.manejarCambioSelectoresFecha());
                yearSelect.addEventListener('change', () => this.manejarCambioSelectoresFecha());
                daySelect.addEventListener('change', () => this.manejarCambioSelectoresFecha());
            }

            if (gotoBtn) {
                gotoBtn.addEventListener('click', () => this.irALaFechaSeleccionada());
            }
        } catch (error) {
            console.error('Error configurando calendario:', error);
        }
    }


    configurarFiltrosTransacciones() {
        try {
            const searchInput = document.getElementById('search-description');
            const filterType = document.getElementById('filter-type');
            const filterCategory = document.getElementById('filter-category');
            const sortBy = document.getElementById('sort-by');
            const clearFilters = document.getElementById('clear-filters');

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.transactionFilters.search = e.target.value;
                    this.aplicarFiltros();
                });
            }

            if (filterType) {
                filterType.addEventListener('change', (e) => {
                    this.transactionFilters.type = e.target.value;
                    this.aplicarFiltros();
                });
            }

            if (filterCategory) {
                filterCategory.addEventListener('change', (e) => {
                    this.transactionFilters.category = e.target.value;
                    this.aplicarFiltros();
                });
            }

            if (sortBy) {
                sortBy.addEventListener('change', (e) => {
                    this.transactionFilters.sortBy = e.target.value;
                    this.aplicarFiltros();
                });
            }

            if (clearFilters) {
                clearFilters.addEventListener('click', () => this.limpiarFiltros());
            }
        } catch (error) {
            console.error('Error configurando filtros:', error);
        }
    }

    configurarPaginacion() {
        try {
            const prevPage = document.getElementById('prev-page');
            const nextPage = document.getElementById('next-page');

            if (prevPage) {
                prevPage.addEventListener('click', () => {
                    if (this.pagination.currentPage > 1) {
                        this.pagination.currentPage--;
                        this.actualizarListaTransacciones();
                    }
                });
            }

            if (nextPage) {
                nextPage.addEventListener('click', () => {
                    const totalPages = Math.ceil(
                        this.pagination.totalItems / this.pagination.itemsPerPage
                    );
                    if (this.pagination.currentPage < totalPages) {
                        this.pagination.currentPage++;
                        this.actualizarListaTransacciones();
                    }
                });
            }
        } catch (error) {
            console.error('Error configurando paginación:', error);
        }
    }

    configurarDetallesDia() {
        try {
            const closeDetail = document.getElementById('close-detail');
            const addTransactionBtn = document.getElementById('add-transaction-btn');

            if (closeDetail) {
                closeDetail.addEventListener('click', () => {
                    const container = document.getElementById('day-detail-container');
                    if (container) container.style.display = 'none';
                });
            }

            if (addTransactionBtn) {
                addTransactionBtn.addEventListener('click', () => {
                    window.location.href =
                        this.currentPage === 'calendario'
                            ? 'transacciones.html'
                            : './pages/transacciones.html';
                });
            }
        } catch (error) {
            console.error('Error configurando detalles del día:', error);
        }
    }

    configurarValidacionInputs() {
        try {
            const inputs = document.querySelectorAll('input[type="number"]');

            inputs.forEach((input) => {
                input.addEventListener('input', (e) => {
                    this.validarInput(e.target);
                });

                input.addEventListener('blur', (e) => {
                    this.validarInput(e.target);
                });
            });
        } catch (error) {
            console.error('Error configurando validación de inputs:', error);
        }
    }

    validarInput(input) {
        try {
            const valor = parseFloat(input.value);
            const min = parseFloat(input.min);

            if (input.value === '') {
                input.classList.remove('valid', 'invalid');
                input.setCustomValidity('');
                return;
            }

            if (isNaN(valor) || valor < min) {
                input.classList.remove('valid');
                input.classList.add('invalid');
                input.setCustomValidity(`El valor debe ser mayor o igual a ${min}`);
            } else {
                input.classList.remove('invalid');
                input.classList.add('valid');
                input.setCustomValidity('');
            }
        } catch (error) {
            console.error('Error validando input:', error);
        }
    }

    // ============ FUNCIONES DE FECHAS Y PERÍODOS ============
    configurarFechasPorDefecto() {
        try {
            const hoy = new Date().toISOString().split('T')[0];
            const campos = ['income-date', 'expense-date', 'start-date', 'end-date'];

            campos.forEach((id) => {
                const campo = document.getElementById(id);
                if (campo) campo.value = hoy;
            });
        } catch (error) {
            console.error('Error configurando fechas por defecto:', error);
        }
    }

    manejarCambioPeriodo(tipo) {
        this.currentPeriod.type = tipo;
        const customDiv = document.getElementById('custom-period');

        if (tipo === 'custom') {
            if (customDiv) customDiv.style.display = 'flex';
        } else {
            if (customDiv) customDiv.style.display = 'none';
            this.actualizarPeriodo();
        }
    }

    actualizarPeriodo() {
        try {
            const now = new Date();

            switch (this.currentPeriod.type) {
                case 'month':
                    this.currentPeriod.start = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        1
                    );
                    this.currentPeriod.end = new Date(
                        now.getFullYear(),
                        now.getMonth() + 1,
                        0
                    );
                    break;
                case 'quarter': {
                    const quarter = Math.floor(now.getMonth() / 3);
                    this.currentPeriod.start = new Date(now.getFullYear(), quarter * 3, 1);
                    this.currentPeriod.end = new Date(
                        now.getFullYear(),
                        (quarter + 1) * 3,
                        0
                    );
                    break;
                }
                case 'year':
                    this.currentPeriod.start = new Date(now.getFullYear(), 0, 1);
                    this.currentPeriod.end = new Date(now.getFullYear(), 11, 31);
                    break;
                case 'all':
                    this.currentPeriod.start = null;
                    this.currentPeriod.end = null;
                    break;
            }

            this.actualizarTextoPeriodo();
            this.refrescarDatosPagina();
        } catch (error) {
            console.error('Error actualizando período:', error);
        }
    }

    aplicarPeriodoPersonalizado() {
        try {
            const startInput = document.getElementById('start-date');
            const endInput = document.getElementById('end-date');

            if (!startInput || !endInput) return;

            const startDate = new Date(startInput.value);
            const endDate = new Date(endInput.value);

            if (startDate > endDate) {
                this.mostrarNotificacion(
                    'La fecha de inicio debe ser anterior a la fecha de fin',
                    'error'
                );
                return;
            }

            this.currentPeriod.start = startDate;
            this.currentPeriod.end = endDate;
            this.actualizarTextoPeriodo();
            this.refrescarDatosPagina();
        } catch (error) {
            this.mostrarNotificacion('Error al aplicar período personalizado', 'error');
        }
    }

    actualizarTextoPeriodo() {
        try {
            const textElement = document.getElementById('current-period-text');
            if (!textElement) return;

            let text = '';

            if (this.currentPeriod.type === 'all') {
                text = 'Todos los períodos';
            } else if (this.currentPeriod.start && this.currentPeriod.end) {
                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                text = `${this.currentPeriod.start.toLocaleDateString(
                    'es-ES',
                    options
                )} - ${this.currentPeriod.end.toLocaleDateString('es-ES', options)}`;
            }

            textElement.textContent = text;
        } catch (error) {
            console.error('Error actualizando texto de período:', error);
        }
    }

    // ============ GESTIÓN DE TRANSACCIONES ============
    agregarIngreso() {
        try {
            const descripcion = document
                .getElementById('income-description')
                ?.value.trim();
            const monto = parseFloat(
                document.getElementById('income-amount')?.value
            );
            const fecha = document.getElementById('income-date')?.value;
            const categoria = document.getElementById('income-category')?.value;

            if (!descripcion || isNaN(monto) || monto <= 0 || !fecha) {
                this.mostrarNotificacion(
                    'Por favor, completa todos los campos correctamente',
                    'error'
                );
                return;
            }

            const ingreso = {
                id: this.generarId(),
                descripcion: descripcion,
                monto: monto,
                fecha: new Date(fecha + 'T12:00:00'),
                categoria: categoria || 'otros',
                tipo: 'ingreso',
            };

            this.ingresos.push(ingreso);
            this.guardarDatos();
            this.refrescarDatosPagina();
            this.limpiarFormulario('income-form');
            this.configurarFechasPorDefecto();

            this.mostrarNotificacion(
                `Ingreso agregado: ${descripcion} - $${monto.toFixed(2)}`,
                'success'
            );
        } catch (error) {
            this.mostrarNotificacion('Error al agregar ingreso', 'error');
        }
    }

    agregarGasto() {
        try {
            const descripcion = document
                .getElementById('expense-description')
                ?.value.trim();
            const monto = parseFloat(
                document.getElementById('expense-amount')?.value
            );
            const fecha = document.getElementById('expense-date')?.value;
            const categoria = document.getElementById('expense-category')?.value;

            if (!descripcion || isNaN(monto) || monto <= 0 || !fecha) {
                this.mostrarNotificacion(
                    'Por favor, completa todos los campos correctamente',
                    'error'
                );
                return;
            }

            const gasto = {
                id: this.generarId(),
                descripcion: descripcion,
                monto: monto,
                fecha: new Date(fecha + 'T12:00:00'),
                categoria: categoria || 'otros',
                tipo: 'gasto',
            };

            this.gastos.push(gasto);
            this.guardarDatos();
            this.refrescarDatosPagina();
            this.limpiarFormulario('expense-form');
            this.configurarFechasPorDefecto();

            this.mostrarNotificacion(
                `Gasto agregado: ${descripcion} - $${monto.toFixed(2)}`,
                'success'
            );
        } catch (error) {
            this.mostrarNotificacion('Error al agregar gasto', 'error');
        }
    }

    eliminarTransaccion(id, tipo) {
        try {
            if (
                !confirm(
                    '¿Estás seguro de que quieres eliminar esta transacción?'
                )
            ) {
                return;
            }

            if (tipo === 'ingreso') {
                this.ingresos = this.ingresos.filter((item) => item.id !== id);
            } else {
                this.gastos = this.gastos.filter((item) => item.id !== id);
            }

            this.guardarDatos();
            this.refrescarDatosPagina();
            this.mostrarNotificacion('Transacción eliminada correctamente', 'info');
        } catch (error) {
            this.mostrarNotificacion('Error al eliminar transacción', 'error');
        }
    }

    limpiarTodo() {
        try {
            if (
                !confirm(
                    '¿Estás seguro de que quieres eliminar TODAS las transacciones? Esta acción no se puede deshacer.'
                )
            ) {
                return;
            }

            this.ingresos = [];
            this.gastos = [];
            this.guardarDatos();
            this.refrescarDatosPagina();
            this.mostrarNotificacion(
                'Todas las transacciones han sido eliminadas',
                'info'
            );
        } catch (error) {
            this.mostrarNotificacion('Error al limpiar datos', 'error');
        }
    }

    // ============ FUNCIONES DE DATOS Y FILTROS ============
    obtenerTransaccionesFiltradas() {
        try {
            const todasTransacciones = [
                ...this.ingresos.map((item) => ({ ...item, tipo: 'ingreso' })),
                ...this.gastos.map((item) => ({ ...item, tipo: 'gasto' })),
            ];

            let filtradas = todasTransacciones;

            // Filtro por período
            if (
                this.currentPeriod.type !== 'all' &&
                this.currentPeriod.start &&
                this.currentPeriod.end
            ) {
                filtradas = filtradas.filter((transaccion) => {
                    const fechaTransaccion = new Date(transaccion.fecha);
                    return (
                        fechaTransaccion >= this.currentPeriod.start &&
                        fechaTransaccion <= this.currentPeriod.end
                    );
                });
            }

            return filtradas;
        } catch (error) {
            console.error('Error obteniendo transacciones filtradas:', error);
            return [];
        }
    }

    aplicarFiltrosTransacciones(transacciones) {
        try {
            let filtradas = [...transacciones];

            // Filtro por búsqueda
            if (this.transactionFilters.search) {
                const search = this.transactionFilters.search.toLowerCase();
                filtradas = filtradas.filter(
                    (t) =>
                        t.descripcion.toLowerCase().includes(search) ||
                        (t.categoria && t.categoria.toLowerCase().includes(search))
                );
            }

            // Filtro por tipo
            if (this.transactionFilters.type !== 'all') {
                filtradas = filtradas.filter(
                    (t) => t.tipo === this.transactionFilters.type
                );
            }

            // Filtro por categoría
            if (this.transactionFilters.category !== 'all') {
                filtradas = filtradas.filter(
                    (t) => t.categoria === this.transactionFilters.category
                );
            }

            // Ordenamiento
            switch (this.transactionFilters.sortBy) {
                case 'date-desc':
                    filtradas.sort(
                        (a, b) => new Date(b.fecha) - new Date(a.fecha)
                    );
                    break;
                case 'date-asc':
                    filtradas.sort(
                        (a, b) => new Date(a.fecha) - new Date(b.fecha)
                    );
                    break;
                case 'amount-desc':
                    filtradas.sort((a, b) => b.monto - a.monto);
                    break;
                case 'amount-asc':
                    filtradas.sort((a, b) => a.monto - b.monto);
                    break;
                case 'description':
                    filtradas.sort((a, b) => a.descripcion.localeCompare(b.descripcion));
                    break;
            }

            return filtradas;
        } catch (error) {
            console.error('Error aplicando filtros:', error);
            return transacciones;
        }
    }

    aplicarFiltros() {
        if (this.currentPage === 'transacciones') {
            this.pagination.currentPage = 1; // Reset a primera página
            this.actualizarListaTransacciones();
        }
    }

    limpiarFiltros() {
        this.transactionFilters = {
            search: '',
            type: 'all',
            category: 'all',
            sortBy: 'date-desc',
        };

        // Limpiar inputs
        const searchInput = document.getElementById('search-description');
        const filterType = document.getElementById('filter-type');
        const filterCategory = document.getElementById('filter-category');
        const sortBy = document.getElementById('sort-by');

        if (searchInput) searchInput.value = '';
        if (filterType) filterType.value = 'all';
        if (filterCategory) filterCategory.value = 'all';
        if (sortBy) sortBy.value = 'date-desc';

        this.aplicarFiltros();
    }

    obtenerTransaccionesEnRango(fechaInicio, fechaFin) {
        try {
            const todasTransacciones = [
                ...this.ingresos.map((item) => ({ ...item, tipo: 'ingreso' })),
                ...this.gastos.map((item) => ({ ...item, tipo: 'gasto' })),
            ];

            return todasTransacciones.filter((transaccion) => {
                const fechaTransaccion = new Date(transaccion.fecha);
                return (
                    fechaTransaccion >= fechaInicio && fechaTransaccion <= fechaFin
                );
            });
        } catch (error) {
            console.error('Error obteniendo transacciones en rango:', error);
            return [];
        }
    }

    // ============ ACTUALIZACIÓN DE INTERFAZ ============
    mostrarResumenInicio() {
        try {
            const totalIngresos = this.calcularTotal(this.ingresos);
            const totalGastos = this.calcularTotal(this.gastos);
            const saldo = totalIngresos - totalGastos;

            this.actualizarElementoTexto(
                'total-income',
                `$${totalIngresos.toFixed(2)}`
            );
            this.actualizarElementoTexto(
                'total-expense',
                `$${totalGastos.toFixed(2)}`
            );

            const balanceElement = document.getElementById('total-balance');
            if (balanceElement) {
                balanceElement.textContent = `$${saldo.toFixed(2)}`;
                balanceElement.style.color = saldo >= 0 ? '#10b981' : '#ef4444';
            }
        } catch (error) {
            console.error('Error mostrando resumen inicio:', error);
        }
    }

    actualizarResumen() {
        try {
            const transaccionesFiltradas = this.obtenerTransaccionesFiltradas();
            const ingresosFiltrados = transaccionesFiltradas.filter(
                (t) => t.tipo === 'ingreso'
            );
            const gastosFiltrados = transaccionesFiltradas.filter(
                (t) => t.tipo === 'gasto'
            );

            const totalIngresos = this.calcularTotal(ingresosFiltrados);
            const totalGastos = this.calcularTotal(gastosFiltrados);
            const saldo = totalIngresos - totalGastos;

            this.actualizarElementoTexto(
                'total-income',
                `$${totalIngresos.toFixed(2)}`
            );
            this.actualizarElementoTexto(
                'total-expense',
                `$${totalGastos.toFixed(2)}`
            );

            const balanceElement = document.getElementById('total-balance');
            if (balanceElement) {
                balanceElement.textContent = `$${saldo.toFixed(2)}`;
                balanceElement.style.color = saldo >= 0 ? '#10b981' : '#ef4444';
            }
        } catch (error) {
            console.error('Error actualizando resumen:', error);
        }
    }

    actualizarResumenMes() {
        try {
            const now = this.currentCalendarDate;
            const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
            const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const transaccionesMes = this.obtenerTransaccionesEnRango(
                inicioMes,
                finMes
            );
            const ingresosMes = transaccionesMes.filter((t) => t.tipo === 'ingreso');
            const gastosMes = transaccionesMes.filter((t) => t.tipo === 'gasto');

            const totalIngresos = this.calcularTotal(ingresosMes);
            const totalGastos = this.calcularTotal(gastosMes);
            const balance = totalIngresos - totalGastos;

            this.actualizarElementoTexto(
                'month-income',
                `$${totalIngresos.toFixed(2)}`
            );
            this.actualizarElementoTexto(
                'month-expense',
                `$${totalGastos.toFixed(2)}`
            );

            this.actualizarElementoTexto('month-expense', `$${totalGastos.toFixed(2)}`);


            const balanceElement = document.getElementById('month-balance');
            if (balanceElement) {
                balanceElement.textContent = `$${balance.toFixed(2)}`;
                balanceElement.style.color = balance >= 0 ? '#10b981' : '#ef4444';
            }
        } catch (error) {
            console.error('Error actualizando resumen del mes:', error);
        }
    }

    cambiarTab(tabName) {
        try {
            // Remover active de todos los tabs
            document
                .querySelectorAll('.nav-tab[data-tab]')
                .forEach((tab) => tab.classList.remove('active'));
            document
                .querySelectorAll('.tab-content')
                .forEach((content) => content.classList.remove('active'));

            // Activar tab seleccionado
            const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
            const selectedContent = document.getElementById(`${tabName}-tab`);

            if (selectedTab) selectedTab.classList.add('active');
            if (selectedContent) selectedContent.classList.add('active');

            // Actualizar contenido específico
            switch (tabName) {
                case 'dashboard':
                    this.actualizarResumen();
                    this.inicializarGrafico();
                    break;
                case 'transactions':
                    this.renderizarTransacciones();
                    break;
                case 'calendar':
                    this.actualizarCalendario();
                    break;
                case 'analytics':
                    this.actualizarAnalytics();
                    break;
            }
        } catch (error) {
            console.error('Error cambiando tab:', error);
        }
    }

    refrescarDatosPagina() {
        switch (this.currentPage) {
            case 'index':
                this.actualizarResumen();
                this.renderizarTransacciones();
                this.actualizarGrafico();
                this.actualizarAnalytics();
                break;
            case 'dashboard':
                this.actualizarResumen();
                this.actualizarGrafico();
                this.actualizarGraficoTendencia();
                this.mostrarTransaccionesRecientes();
                break;
            case 'transacciones':
                this.actualizarListaTransacciones();
                break;
            case 'calendario':
                this.actualizarResumenMes();
                this.actualizarCalendario();
                this.actualizarEstadisticasMensuales();
                break;
            case 'analisis':
                this.actualizarEstadisticasGenerales();
                this.actualizarGraficosAnalisis();
                this.actualizarPatrones();
                this.actualizarComparativas();
                this.generarInsights();
                break;
        }
    }

    // ============ RENDERIZADO DE TRANSACCIONES ============
    renderizarTransacciones() {
        try {
            const transaccionesFiltradas = this.obtenerTransaccionesFiltradas();
            const ingresosFiltrados = transaccionesFiltradas.filter(
                (t) => t.tipo === 'ingreso'
            );
            const gastosFiltrados = transaccionesFiltradas.filter(
                (t) => t.tipo === 'gasto'
            );

            this.renderizarLista('income-list', ingresosFiltrados, 'ingreso');
            this.renderizarLista('expense-list', gastosFiltrados, 'gasto');
        } catch (error) {
            console.error('Error renderizando transacciones:', error);
        }
    }

    renderizarLista(containerId, transacciones, tipo) {
        try {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (transacciones.length === 0) {
                container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-${tipo === 'ingreso' ? 'arrow-up' : 'arrow-down'}"></i>
            <p>No hay ${tipo === 'ingreso' ? 'ingresos' : 'gastos'} registrados</p>
          </div>`;
                return;
            }

            const html = transacciones
                .map((transaccion) => {
                    const fecha = new Date(transaccion.fecha).toLocaleDateString(
                        'es-ES',
                        {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        }
                    );

                    const categoria = transaccion.categoria
                        ? ` • ${transaccion.categoria}`
                        : '';

                    return `
            <div class="transaction-item" data-id="${transaccion.id}" data-tipo="${tipo}">
              <div class="transaction-info">
                <div class="transaction-description">${transaccion.descripcion}</div>
                <div class="transaction-date">${fecha}${categoria}</div>
              </div>
              <div class="transaction-amount ${tipo}">${transaccion.monto.toFixed(
                        2
                    )}</div>
              <button class="delete-btn" onclick="gestorPresupuesto.eliminarTransaccion('${transaccion.id}', '${tipo}')" title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </div>`;
                })
                .join('');

            container.innerHTML = html;
        } catch (error) {
            console.error('Error renderizando lista:', error);
        }
    }

    actualizarListaTransacciones() {
        try {
            const container = document.getElementById('all-transactions-list');
            if (!container) return;

            const transacciones = this.obtenerTransaccionesFiltradas();
            const transaccionesFiltradas = this.aplicarFiltrosTransacciones(
                transacciones
            );

            // Actualizar paginación
            this.pagination.totalItems = transaccionesFiltradas.length;
            const totalPages = Math.ceil(
                this.pagination.totalItems / this.pagination.itemsPerPage
            );

            // Obtener página actual
            const startIndex =
                (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
            const endIndex = startIndex + this.pagination.itemsPerPage;
            const paginatedTransactions = transaccionesFiltradas.slice(
                startIndex,
                endIndex
            );

            if (paginatedTransactions.length === 0) {
                container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-search"></i>
            <p>No se encontraron transacciones con los filtros aplicados</p>
          </div>`;
            } else {
                const html = paginatedTransactions
                    .map((transaccion) => {
                        const fecha = new Date(transaccion.fecha).toLocaleDateString(
                            'es-ES',
                            {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            }
                        );

                        return `
              <div class="transaction-item">
                <div class="transaction-info">
                  <div class="transaction-description">${transaccion.descripcion}</div>
                  <div class="transaction-date">${fecha} • ${transaccion.categoria || 'Sin categoría'
                            }</div>
                </div>
                <div class="transaction-amount ${transaccion.tipo}">
                  ${transaccion.tipo === 'ingreso' ? '+' : '-'}${transaccion.monto.toFixed(
                                2
                            )}
                </div>
                <button class="delete-btn" onclick="gestorPresupuesto.eliminarTransaccion('${transaccion.id}', '${transaccion.tipo}')" title="Eliminar">
                  <i class="fas fa-trash"></i>
                </button>
              </div>`;
                    })
                    .join('');

                container.innerHTML = html;
            }

            // Actualizar controles de paginación
            this.actualizarControlesPaginacion(totalPages);
            this.actualizarContadorTransacciones(transaccionesFiltradas.length);
        } catch (error) {
            console.error('Error actualizando lista de transacciones:', error);
        }
    }

    actualizarControlesPaginacion(totalPages) {
        try {
            const prevBtn = document.getElementById('prev-page');
            const nextBtn = document.getElementById('next-page');
            const pageInfo = document.getElementById('page-info');
            const paginationInfo = document.getElementById('pagination-info');

            if (prevBtn) prevBtn.disabled = this.pagination.currentPage <= 1;
            if (nextBtn)
                nextBtn.disabled = this.pagination.currentPage >= totalPages;
            if (pageInfo)
                pageInfo.textContent = `Página ${this.pagination.currentPage} de ${totalPages}`;

            if (paginationInfo) {
                const start =
                    (this.pagination.currentPage - 1) * this.pagination.itemsPerPage + 1;
                const end = Math.min(
                    start + this.pagination.itemsPerPage - 1,
                    this.pagination.totalItems
                );
                paginationInfo.textContent = `Mostrando ${start} - ${end} de ${this.pagination.totalItems} transacciones`;
            }
        } catch (error) {
            console.error('Error actualizando controles de paginación:', error);
        }
    }

    actualizarContadorTransacciones(total) {
        try {
            const badge = document.getElementById('transaction-count-badge');
            if (badge) badge.textContent = total;
        } catch (error) {
            console.error('Error actualizando contador:', error);
        }
    }

    mostrarTransaccionesRecientes() {
        try {
            const container = document.getElementById('recent-transactions-list');
            if (!container) return;

            const todasTransacciones = [
                ...this.ingresos.map((item) => ({ ...item, tipo: 'ingreso' })),
                ...this.gastos.map((item) => ({ ...item, tipo: 'gasto' })),
            ];

            const recientes = todasTransacciones
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                .slice(0, 5);

            if (recientes.length === 0) {
                container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-clock"></i>
            <p>No hay transacciones recientes</p>
          </div>`;
                return;
            }

            const html = recientes
                .map((transaccion) => {
                    const fecha = new Date(transaccion.fecha).toLocaleDateString(
                        'es-ES',
                        {
                            month: 'short',
                            day: 'numeric',
                        }
                    );

                    return `
            <div class="transaction-item">
              <div class="transaction-info">
                <div class="transaction-description">${transaccion.descripcion}</div>
                <div class="transaction-date">${fecha} • ${transaccion.categoria || 'Sin categoría'
                        }</div>
              </div>
              <div class="transaction-amount ${transaccion.tipo}">
                ${transaccion.tipo === 'ingreso' ? '+' : '-'}${transaccion.monto.toFixed(
                            2
                        )}
              </div>
            </div>`;
                })
                .join('');

            container.innerHTML = html;
        } catch (error) {
            console.error('Error mostrando transacciones recientes:', error);
        }
    }

    actualizarFiltrosCategorias() {
        try {
            const filterCategory = document.getElementById('filter-category');
            if (!filterCategory) return;

            const todasTransacciones = [
                ...this.ingresos.map((item) => ({ ...item, tipo: 'ingreso' })),
                ...this.gastos.map((item) => ({ ...item, tipo: 'gasto' })),
            ];

            const categorias = [
                ...new Set(todasTransacciones.map((t) => t.categoria).filter((c) => c)),
            ];

            // Mantener la opción "Todas"
            const currentValue = filterCategory.value;
            filterCategory.innerHTML = '<option value="all">Todas</option>';

            categorias.forEach((categoria) => {
                const option = document.createElement('option');
                option.value = categoria;
                option.textContent =
                    categoria.charAt(0).toUpperCase() + categoria.slice(1);
                filterCategory.appendChild(option);
            });

            filterCategory.value = currentValue;
        } catch (error) {
            console.error('Error actualizando filtros de categorías:', error);
        }
    }

    // ============ FUNCIONES DE UTILIDAD ============
    calcularTotal(transacciones) {
        return transacciones.reduce((sum, item) => sum + item.monto, 0);
    }

    generarId() {
        return (
            Date.now().toString(36) + Math.random().toString(36).substr(2)
        );
    }

    actualizarElementoTexto(id, texto) {
        try {
            const elemento = document.getElementById(id);
            if (elemento) elemento.textContent = texto;
        } catch (error) {
            console.error(`Error actualizando elemento ${id}:`, error);
        }
    }

    limpiarFormulario(formId) {
        try {
            const form = document.getElementById(formId);
            if (form) {
                form.reset();
                form.querySelectorAll('input').forEach((input) => {
                    input.classList.remove('valid', 'invalid');
                });
            }
        } catch (error) {
            console.error('Error limpiando formulario:', error);
        }
    }

    // ============ FUNCIONES DE CALENDARIO ============
    navegarCalendario(direccion) {
        try {
            this.currentCalendarDate.setMonth(
                this.currentCalendarDate.getMonth() + direccion
            );
            this.actualizarCalendario();
            this.actualizarResumenMes();
        } catch (error) {
            console.error('Error navegando calendario:', error);
        }
    }

    actualizarCalendario() {
        try {
            const grid = document.getElementById('calendar-grid');
            const title = document.getElementById('calendar-title');
            if (!grid) return;

            const año = this.currentCalendarDate.getFullYear();
            const mes = this.currentCalendarDate.getMonth();
            const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

            if (this.calendarViewMode === 'year') {
                if (title) title.textContent = `${año} (Vista anual)`;
                this.generarCalendarioAnual(año, grid);
            } else {
                if (title) title.textContent = `${meses[mes]} ${año}`;
                this.generarCalendario(año, mes, grid);
            }
        } catch (error) {
            console.error('Error actualizando calendario:', error);
        }
    }


    generarCalendario(año, mes, grid) {
        try {
            const primerDia = new Date(año, mes, 1);
            const ultimoDia = new Date(año, mes + 1, 0);

            let html = '';

            // Headers de días
            const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            dias.forEach((dia) => {
                html += `<div class="calendar-day-header">${dia}</div>`;
            });

            // Espacios vacíos antes del primer día
            for (let i = 0; i < primerDia.getDay(); i++) {
                html += `<div class="calendar-day"></div>`;
            }

            // Días del mes
            for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
                const fecha = new Date(año, mes, dia);
                const transaccionesDia = this.obtenerTransaccionesPorFecha(fecha);
                const balance = this.calcularBalanceDiario(transaccionesDia);

                const tieneTrans =
                    transaccionesDia.length > 0 ? 'has-transactions' : '';
                const balanceHtml =
                    balance !== 0
                        ? `<div class="calendar-day-amount ${balance > 0 ? 'positive' : 'negative'
                        }">
                 ${balance > 0 ? '+' : ''}$${balance.toFixed(0)}
               </div>`
                        : '';

                html += `
          <div class="calendar-day ${tieneTrans}" onclick="gestorPresupuesto.mostrarDetallesDia('${fecha.toISOString().split('T')[0]
                    }')">
            <div class="calendar-day-number">${dia}</div>
            ${balanceHtml}
          </div>`;
            }

            grid.innerHTML = html;
        } catch (error) {
            console.error('Error generando calendario:', error);
        }
    }

    obtenerTransaccionesPorFecha(fecha) {
        try {
            // comparar por componentes locales para evitar saltos UTC
            const y = fecha.getFullYear();
            const m = fecha.getMonth();
            const d = fecha.getDate();

            const todasTransacciones = [
                ...this.ingresos.map(item => ({ ...item, tipo: 'ingreso' })),
                ...this.gastos.map(item => ({ ...item, tipo: 'gasto' }))
            ];

            return todasTransacciones.filter(t => {
                const ft = new Date(t.fecha); // viene como ISO (Z) o local
                return (
                    ft.getFullYear() === y &&
                    ft.getMonth() === m &&
                    ft.getDate() === d
                );
            });
        } catch (error) {
            console.error('Error obteniendo transacciones por fecha:', error);
            return [];
        }
    }

    calcularBalanceDiario(transacciones) {
        try {
            return transacciones.reduce((total, transaccion) => {
                return (
                    total +
                    (transaccion.tipo === 'ingreso' ? transaccion.monto : -transaccion.monto)
                );
            }, 0);
        } catch (error) {
            console.error('Error calculando balance diario:', error);
            return 0;
        }
    }

    mostrarDetallesDia(fechaStr) {
        try {
            const fecha = new Date(fechaStr + 'T12:00:00');
            const transacciones = this.obtenerTransaccionesPorFecha(fecha);

            if (transacciones.length === 0) {
                this.mostrarNotificacion(
                    `No hay transacciones para ${fecha.toLocaleDateString('es-ES')}`,
                    'info'
                );
                return;
            }

            const container = document.getElementById('day-detail-container');
            const title = document.getElementById('selected-day-title');
            const dayIncome = document.getElementById('day-income');
            const dayExpense = document.getElementById('day-expense');
            const dayBalance = document.getElementById('day-balance');
            const dayList = document.getElementById('day-transactions-list');

            if (!container) {
                // Fallback para alert
                const detalles = transacciones
                    .map((t) => {
                        const signo = t.tipo === 'ingreso' ? '+' : '-';
                        return `${t.descripcion}: ${signo}$${t.monto.toFixed(2)} (${t.categoria || 'Sin categoría'
                            })`;
                    })
                    .join('\n');

                alert(
                    `Transacciones del ${fecha.toLocaleDateString('es-ES')}:\n\n${detalles}`
                );
                return;
            }

            // Actualizar detalles
            const ingresos = transacciones.filter((t) => t.tipo === 'ingreso');
            const gastos = transacciones.filter((t) => t.tipo === 'gasto');
            const totalIngresos = this.calcularTotal(ingresos);
            const totalGastos = this.calcularTotal(gastos);
            const balance = totalIngresos - totalGastos;

            if (title)
                title.textContent = `Transacciones del ${fecha.toLocaleDateString(
                    'es-ES'
                )}`;
            if (dayIncome) dayIncome.textContent = `$${totalIngresos.toFixed(2)}`;
            if (dayExpense) dayExpense.textContent = `$${totalGastos.toFixed(2)}`;
            if (dayBalance) {
                dayBalance.textContent = `$${balance.toFixed(2)}`;
                dayBalance.className = `stat-value ${balance >= 0 ? 'income' : 'expense'}`;
            }

            if (dayList) {
                const html = transacciones
                    .map(
                        (t) => `
          <div class="transaction-item">
            <div class="transaction-info">
              <div class="transaction-description">${t.descripcion}</div>
              <div class="transaction-date">${t.categoria || 'Sin categoría'}</div>
            </div>
            <div class="transaction-amount ${t.tipo}">
              ${t.tipo === 'ingreso' ? '+' : '-'}$${t.monto.toFixed(2)}
            </div>
          </div>`
                    )
                    .join('');
                dayList.innerHTML = html;
            }

            container.style.display = 'block';
        } catch (error) {
            this.mostrarNotificacion('Error al mostrar detalles del día', 'error');
        }
    }

    actualizarEstadisticasMensuales() {
        try {
            const now = this.currentCalendarDate;
            const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
            const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const transaccionesMes = this.obtenerTransaccionesEnRango(
                inicioMes,
                finMes
            );
            const gastosMes = transaccionesMes.filter((t) => t.tipo === 'gasto');

            // Días con actividad
            const diasConActividad = new Set(
                transaccionesMes.map((t) => new Date(t.fecha).toDateString())
            ).size;

            // Gasto diario promedio
            const gastoPromedio =
                gastosMes.length > 0
                    ? gastosMes.reduce((sum, t) => sum + t.monto, 0) / diasConActividad
                    : 0;

            // Mejor día (balance)
            const balancesPorDia = {};
            transaccionesMes.forEach((t) => {
                const dia = new Date(t.fecha).toDateString();
                if (!balancesPorDia[dia]) balancesPorDia[dia] = 0;
                balancesPorDia[dia] += t.tipo === 'ingreso' ? t.monto : -t.monto;
            });

            const mejorBalance = Math.max(...Object.values(balancesPorDia), 0);

            this.actualizarElementoTexto('days-with-transactions', diasConActividad);
            this.actualizarElementoTexto(
                'avg-daily-expense',
                `$${gastoPromedio.toFixed(0)}`
            );
            this.actualizarElementoTexto(
                'best-day-balance',
                `$${mejorBalance.toFixed(0)}`
            );
            this.actualizarElementoTexto('total-transactions', transaccionesMes.length);
        } catch (error) {
            console.error('Error actualizando estadísticas mensuales:', error);
        }
    }

    // ============ FUNCIONES DE ANÁLISIS ============
    actualizarEstadisticasGenerales() {
        try {
            const transacciones = this.obtenerTransaccionesFiltradas();
            const ingresos = transacciones.filter((t) => t.tipo === 'ingreso');
            const gastos = transacciones.filter((t) => t.tipo === 'gasto');

            const totalIngresos = this.calcularTotal(ingresos);
            const totalGastos = this.calcularTotal(gastos);
            const promedioIngresos =
                ingresos.length > 0 ? totalIngresos / ingresos.length : 0;
            const promedioGastos =
                gastos.length > 0 ? totalGastos / gastos.length : 0;
            const tasaAhorro =
                totalIngresos > 0
                    ? ((totalIngresos - totalGastos) / totalIngresos) * 100
                    : 0;

            const fechasUnicas = new Set(
                transacciones.map((t) => new Date(t.fecha).toDateString())
            ).size;

            const mayorGasto = gastos.length > 0 ? Math.max(...gastos.map((g) => g.monto)) : 0;

            this.actualizarElementoTexto(
                'avg-income',
                `$${promedioIngresos.toFixed(0)}`
            );
            this.actualizarElementoTexto(
                'avg-expense',
                `$${promedioGastos.toFixed(0)}`
            );
            this.actualizarElementoTexto('savings-rate', `${tasaAhorro.toFixed(1)}%`);
            this.actualizarElementoTexto('transaction-count', transacciones.length);
            this.actualizarElementoTexto('days-tracked', fechasUnicas);
            this.actualizarElementoTexto(
                'largest-expense',
                `$${mayorGasto.toFixed(0)}`
            );
        } catch (error) {
            console.error('Error actualizando estadísticas generales:', error);
        }
    }

    actualizarAnalytics() {
        try {
            const transacciones = this.obtenerTransaccionesFiltradas();
            const ingresos = transacciones.filter((t) => t.tipo === 'ingreso');
            const gastos = transacciones.filter((t) => t.tipo === 'gasto');

            const promedioIngresos =
                ingresos.length > 0
                    ? ingresos.reduce((sum, t) => sum + t.monto, 0) / ingresos.length
                    : 0;
            const promedioGastos =
                gastos.length > 0
                    ? gastos.reduce((sum, t) => sum + t.monto, 0) / gastos.length
                    : 0;

            const fechasUnicas = new Set(
                transacciones.map((t) => new Date(t.fecha).toDateString())
            );

            this.actualizarElementoTexto(
                'avg-income',
                `$${promedioIngresos.toFixed(0)}`
            );
            this.actualizarElementoTexto(
                'avg-expense',
                `$${promedioGastos.toFixed(0)}`
            );
            this.actualizarElementoTexto('transaction-count', transacciones.length);
            this.actualizarElementoTexto('days-tracked', fechasUnicas.size);

            this.actualizarGraficoCategoria(gastos);
            this.actualizarGraficoSemanal(transacciones);
        } catch (error) {
            console.error('Error actualizando analytics:', error);
        }
    }

    actualizarGraficosAnalisis() {
        try {
            const transacciones = this.obtenerTransaccionesFiltradas();
            const gastos = transacciones.filter((t) => t.tipo === 'gasto');

            this.actualizarGraficoTendenciaAnalisis(transacciones);
            this.actualizarGraficoCategoria(gastos);
            this.actualizarGraficoSemanal(transacciones);
            this.actualizarGraficoHorario(transacciones);
        } catch (error) {
            console.error('Error actualizando gráficos de análisis:', error);
        }
    }

    actualizarPatrones() {
        try {
            const transacciones = this.obtenerTransaccionesFiltradas();
            const gastos = transacciones.filter((t) => t.tipo === 'gasto');

            // Día más gastador
            const gastosPorDia = {};
            const diasSemana = [
                'Domingo',
                'Lunes',
                'Martes',
                'Miércoles',
                'Jueves',
                'Viernes',
                'Sábado',
            ];

            gastos.forEach((gasto) => {
                const dia = new Date(gasto.fecha).getDay();
                gastosPorDia[dia] = (gastosPorDia[dia] || 0) + gasto.monto;
            });

            const diaMasGastador = Object.entries(gastosPorDia).reduce(
                (max, [dia, total]) =>
                    total > max.total ? { dia: parseInt(dia, 10), total } : max,
                { dia: 0, total: 0 }
            );

            // Tendencia general
            const gastosOrdenados = gastos.sort(
                (a, b) => new Date(a.fecha) - new Date(b.fecha)
            );
            const mitad = Math.floor(gastosOrdenados.length / 2);
            const primerMitad = gastosOrdenados.slice(0, mitad);
            const segundaMitad = gastosOrdenados.slice(mitad);

            const promedioPrimera =
                primerMitad.length > 0
                    ? primerMitad.reduce((sum, g) => sum + g.monto, 0) / primerMitad.length
                    : 0;
            const promedioSegunda =
                segundaMitad.length > 0
                    ? segundaMitad.reduce((sum, g) => sum + g.monto, 0) / segundaMitad.length
                    : 0;

            const tendencia =
                promedioSegunda > promedioPrimera
                    ? 'Aumentando'
                    : promedioSegunda < promedioPrimera
                        ? 'Disminuyendo'
                        : 'Estable';

            // Gastos atípicos (más de 2 desviaciones estándar)
            const promedioGastos =
                gastos.length > 0
                    ? gastos.reduce((sum, g) => sum + g.monto, 0) / gastos.length
                    : 0;
            const varianza =
                gastos.length > 0
                    ? gastos.reduce(
                        (sum, g) => sum + Math.pow(g.monto - promedioGastos, 2),
                        0
                    ) / gastos.length
                    : 0;
            const desviacion = Math.sqrt(varianza);
            const gastosAtipicos = gastos.filter(
                (g) => Math.abs(g.monto - promedioGastos) > 2 * desviacion
            ).length;

            // Frecuencia promedio
            const diasUnicos = new Set(
                transacciones.map((t) => new Date(t.fecha).toDateString())
            ).size;
            const frecuenciaPromedio = diasUnicos > 0 ? transacciones.length / diasUnicos : 0;

            this.actualizarElementoTexto(
                'highest-spending-day',
                diaMasGastador.total > 0 ? diasSemana[diaMasGastador.dia] : '-'
            );
            this.actualizarElementoTexto('general-trend', tendencia);
            this.actualizarElementoTexto('unusual-expenses', gastosAtipicos);
            this.actualizarElementoTexto(
                'avg-frequency',
                frecuenciaPromedio.toFixed(1)
            );
        } catch (error) {
            console.error('Error actualizando patrones:', error);
        }
    }

    actualizarComparativas() {
        try {
            // Comparativa mes actual vs anterior
            const now = new Date();
            const inicioMesActual = new Date(now.getFullYear(), now.getMonth(), 1);
            const finMesActual = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const inicioMesAnterior = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
            );
            const finMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0);

            const transaccionesMesActual = this.obtenerTransaccionesEnRango(
                inicioMesActual,
                finMesActual
            );
            const transaccionesMesAnterior = this.obtenerTransaccionesEnRango(
                inicioMesAnterior,
                finMesAnterior
            );

            const ingresosMesActual = this.calcularTotal(
                transaccionesMesActual.filter((t) => t.tipo === 'ingreso')
            );
            const gastosMesActual = this.calcularTotal(
                transaccionesMesActual.filter((t) => t.tipo === 'gasto')
            );
            const ingresosMesAnterior = this.calcularTotal(
                transaccionesMesAnterior.filter((t) => t.tipo === 'ingreso')
            );
            const gastosMesAnterior = this.calcularTotal(
                transaccionesMesAnterior.filter((t) => t.tipo === 'gasto')
            );

            const cambioIngresos =
                ingresosMesAnterior > 0
                    ? ((ingresosMesActual - ingresosMesAnterior) / ingresosMesAnterior) *
                    100
                    : 0;
            const cambioGastos =
                gastosMesAnterior > 0
                    ? ((gastosMesActual - gastosMesAnterior) / gastosMesAnterior) * 100
                    : 0;
            const cambioAhorro =
                ingresosMesActual -
                gastosMesActual -
                (ingresosMesAnterior - gastosMesAnterior);

            this.actualizarComparativa('income-comparison', cambioIngresos);
            this.actualizarComparativa('expense-comparison', cambioGastos);
            this.actualizarComparativa('savings-comparison', cambioAhorro, true);
        } catch (error) {
            console.error('Error actualizando comparativas:', error);
        }
    }

    actualizarComparativa(elementId, valor, esAbsoluto = false) {
        try {
            const elemento = document.getElementById(elementId);
            if (!elemento) return;

            let texto, clase;
            if (esAbsoluto) {
                texto = `${valor >= 0 ? '+' : ''}${Math.abs(valor).toFixed(2)}`;
                clase = valor >= 0 ? 'positive' : 'negative';
            } else {
                texto = `${valor >= 0 ? '+' : ''}${valor.toFixed(1)}%`;
                clase = valor >= 0 ? 'positive' : 'negative';
            }

            elemento.textContent = texto;
            elemento.className = `comparison-value ${clase}`;
        } catch (error) {
            console.error('Error actualizando comparativa:', error);
        }
    }

    generarInsights() {
        try {
            const container = document.getElementById('insights-container');
            if (!container) return;

            const transacciones = this.obtenerTransaccionesFiltradas();
            const gastos = transacciones.filter((t) => t.tipo === 'gasto');
            const ingresos = transacciones.filter((t) => t.tipo === 'ingreso');

            const insights = [];

            // Insight sobre categoría más gastada
            if (gastos.length > 0) {
                const gastosPorCategoria = {};
                gastos.forEach((gasto) => {
                    const cat = gasto.categoria || 'otros';
                    gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + gasto.monto;
                });

                const categoriaMasGastada = Object.entries(gastosPorCategoria).reduce(
                    (max, [cat, total]) =>
                        total > max.total ? { cat, total } : max,
                    { cat: '', total: 0 }
                );

                if (categoriaMasGastada.total > 0) {
                    insights.push({
                        tipo: 'info',
                        titulo: 'Categoría Principal de Gastos',
                        descripcion: `Tu mayor gasto es en ${categoriaMasGastada.cat} con ${categoriaMasGastada.total.toFixed(
                            2
                        )}. Representa el ${(
                            (categoriaMasGastada.total / this.calcularTotal(gastos)) *
                            100
                        ).toFixed(1)}% de tus gastos totales.`,
                    });
                }
            }

            // Insight sobre balance
            const totalIngresos = this.calcularTotal(ingresos);
            const totalGastos = this.calcularTotal(gastos);
            const balance = totalIngresos - totalGastos;

            if (balance > 0) {
                insights.push({
                    tipo: 'success',
                    titulo: 'Balance Positivo',
                    descripcion: `¡Excelente! Tienes un balance positivo de ${balance.toFixed(
                        2
                    )}. Estás ahorrando el ${((balance / totalIngresos) * 100).toFixed(
                        1
                    )}% de tus ingresos.`,
                });
            } else if (balance < 0) {
                insights.push({
                    tipo: 'warning',
                    titulo: 'Gastos Superiores a Ingresos',
                    descripcion: `Tus gastos superan tus ingresos por ${Math.abs(
                        balance
                    ).toFixed(2)}. Considera revisar tus gastos para mejorar tu situación financiera.`,
                });
            }

            // Insight sobre frecuencia
            if (transacciones.length > 0) {
                const diasUnicos = new Set(
                    transacciones.map((t) => new Date(t.fecha).toDateString())
                ).size;
                const frecuencia = transacciones.length / diasUnicos;

                if (frecuencia > 3) {
                    insights.push({
                        tipo: 'info',
                        titulo: 'Alta Actividad Financiera',
                        descripcion: `Registras un promedio de ${frecuencia.toFixed(
                            1
                        )} transacciones por día. Esto indica un buen control de tus finanzas.`,
                    });
                }
            }

            // Renderizar insights
            if (insights.length === 0) {
                container.innerHTML = `
          <div class="insight-card">
            <div class="insight-title">Sin suficientes datos</div>
            <div class="insight-description">Agrega más transacciones para obtener insights personalizados sobre tus hábitos financieros.</div>
          </div>`;
            } else {
                container.innerHTML = insights
                    .map(
                        (insight) => `
          <div class="insight-card ${insight.tipo}">
            <div class="insight-title">${insight.titulo}</div>
            <div class="insight-description">${insight.descripcion}</div>
          </div>`
                    )
                    .join('');
            }
        } catch (error) {
            console.error('Error generando insights:', error);
        }
    }

    // ============ FUNCIONES DE GRÁFICOS ============
    inicializarGrafico() {
        try {
            if (!this.verificarChartJS()) return;

            const ctx = document.getElementById('budget-chart');
            if (!ctx) return;

            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }

            this.chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Ingresos', 'Gastos'],
                    datasets: [
                        {
                            data: [0, 0],
                            backgroundColor: ['#10b981', '#ef4444'],
                            borderWidth: 0,
                            hoverOffset: 4,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: { size: 14 },
                            },
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage =
                                        total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                    return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                                },
                            },
                        },
                    },
                },
            });

            this.actualizarGrafico();
        } catch (error) {
            console.error('Error inicializando gráfico:', error);
        }
    }

    actualizarGrafico() {
        try {
            if (!this.chart) {
                this.inicializarGrafico();
                return;
            }

            const transaccionesFiltradas = this.obtenerTransaccionesFiltradas();
            const ingresosFiltrados = transaccionesFiltradas.filter(
                (t) => t.tipo === 'ingreso'
            );
            const gastosFiltrados = transaccionesFiltradas.filter(
                (t) => t.tipo === 'gasto'
            );

            const totalIngresos = this.calcularTotal(ingresosFiltrados);
            const totalGastos = this.calcularTotal(gastosFiltrados);

            this.chart.data.datasets[0].data = [totalIngresos, totalGastos];
            this.chart.update('active');

            this.actualizarEstadoGrafico(
                `Actualizado: $${totalIngresos.toFixed(
                    2
                )} ingresos, $${totalGastos.toFixed(2)} gastos`,
                'success'
            );
        } catch (error) {
            this.actualizarEstadoGrafico('Error al actualizar', 'error');
            console.error('Error actualizando gráfico:', error);
        }
    }

    actualizarGraficoTendencia() {
        try {
            const ctx = document.getElementById('trend-chart');
            if (!ctx) return;

            if (this.additionalCharts.trend) {
                this.additionalCharts.trend.destroy();
            }

            const transacciones = this.obtenerTransaccionesFiltradas();
            const datosmensuales = this.agruparPorMes(transacciones);

            this.additionalCharts.trend = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: datosmensuales.map((d) => d.mes),
                    datasets: [
                        {
                            label: 'Ingresos',
                            data: datosmensuales.map((d) => d.ingresos),
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                        },
                        {
                            label: 'Gastos',
                            data: datosmensuales.map((d) => d.gastos),
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.4,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    scales: { y: { beginAtZero: true } },
                },
            });
        } catch (error) {
            console.error('Error actualizando gráfico de tendencia:', error);
        }
    }

    actualizarGraficoCategoria(gastos) {
        try {
            const ctx = document.getElementById('category-chart');
            if (!ctx) return;

            if (this.additionalCharts.category) {
                this.additionalCharts.category.destroy();
            }

            const datosCategoria = {};
            gastos.forEach((gasto) => {
                const categoria = gasto.categoria || 'otros';
                datosCategoria[categoria] = (datosCategoria[categoria] || 0) + gasto.monto;
            });

            const etiquetas = Object.keys(datosCategoria);
            const datos = Object.values(datosCategoria);
            const colores = [
                '#ef4444',
                '#f59e0b',
                '#10b981',
                '#3b82f6',
                '#8b5cf6',
                '#ec4899',
                '#14b8a6',
                '#f97316',
            ];

            if (etiquetas.length === 0) {
                ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
                return;
            }

            this.additionalCharts.category = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: etiquetas.map(
                        (label) => label.charAt(0).toUpperCase() + label.slice(1)
                    ),
                    datasets: [
                        {
                            label: 'Gastos por Categoría',
                            data: datos,
                            backgroundColor: colores.slice(0, etiquetas.length),
                            borderWidth: 0,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                },
            });
        } catch (error) {
            console.error('Error actualizando gráfico de categorías:', error);
        }
    }

    actualizarGraficoSemanal(transacciones) {
        try {
            const ctx = document.getElementById('weekly-chart');
            if (!ctx) return;

            if (this.additionalCharts.weekly) {
                this.additionalCharts.weekly.destroy();
            }

            const datosSemana = new Array(7).fill(0);
            const dias = [
                'Domingo',
                'Lunes',
                'Martes',
                'Miércoles',
                'Jueves',
                'Viernes',
                'Sábado',
            ];

            transacciones.forEach((transaccion) => {
                const diaSemana = new Date(transaccion.fecha).getDay();
                datosSemana[diaSemana]++;
            });

            this.additionalCharts.weekly = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: dias,
                    datasets: [
                        {
                            label: 'Actividad por Día',
                            data: datosSemana,
                            borderColor: '#2563eb',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            pointBackgroundColor: '#2563eb',
                            pointBorderColor: '#2563eb',
                            pointRadius: 4,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        r: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 },
                        },
                    },
                },
            });
        } catch (error) {
            console.error('Error actualizando gráfico semanal:', error);
        }
    }

    actualizarGraficoTendenciaAnalisis(transacciones) {
        try {
            const ctx = document.getElementById('trend-chart');
            if (!ctx) return;

            if (this.additionalCharts.trendAnalysis) {
                this.additionalCharts.trendAnalysis.destroy();
            }

            const period = document.getElementById('trend-period')?.value || 'monthly';
            let datosAgrupados;

            switch (period) {
                case 'daily':
                    datosAgrupados = this.agruparPorDia(transacciones);
                    break;
                case 'weekly':
                    datosAgrupados = this.agruparPorSemana(transacciones);
                    break;
                default:
                    datosAgrupados = this.agruparPorMes(transacciones);
            }

            this.additionalCharts.trendAnalysis = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: datosAgrupados.map((d) => d.periodo),
                    datasets: [
                        {
                            label: 'Ingresos',
                            data: datosAgrupados.map((d) => d.ingresos),
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: false,
                        },
                        {
                            label: 'Gastos',
                            data: datosAgrupados.map((d) => d.gastos),
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.4,
                            fill: false,
                        },
                        {
                            label: 'Balance',
                            data: datosAgrupados.map((d) => d.ingresos - d.gastos),
                            borderColor: '#2563eb',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            tension: 0.4,
                            fill: true,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    scales: { y: { beginAtZero: false } },
                },
            });
        } catch (error) {
            console.error('Error actualizando gráfico de tendencia de análisis:', error);
        }
    }

    actualizarGraficoHorario(transacciones) {
        try {
            const ctx = document.getElementById('hourly-chart');
            if (!ctx) return;

            if (this.additionalCharts.hourly) {
                this.additionalCharts.hourly.destroy();
            }

            const datosHora = new Array(24).fill(0);
            transacciones.forEach((transaccion) => {
                const hora = new Date(transaccion.fecha).getHours();
                datosHora[hora]++;
            });

            const etiquetas = Array.from({ length: 24 }, (_, i) => `${i}:00`);

            this.additionalCharts.hourly = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: etiquetas,
                    datasets: [
                        {
                            label: 'Transacciones por Hora',
                            data: datosHora,
                            backgroundColor: '#3b82f6',
                            borderWidth: 0,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                },
            });
        } catch (error) {
            console.error('Error actualizando gráfico horario:', error);
        }
    }

    // ============ FUNCIONES DE AGRUPACIÓN ============
    agruparPorMes(transacciones) {
        try {
            const datosmensuales = {};

            transacciones.forEach((transaccion) => {
                const fecha = new Date(transaccion.fecha);
                const clave = `${fecha.getFullYear()}-${fecha.getMonth()}`;
                const mesTexto = fecha.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                });

                if (!datosmensuales[clave]) {
                    datosmensuales[clave] = {
                        mes: mesTexto,
                        periodo: mesTexto,
                        ingresos: 0,
                        gastos: 0,
                    };
                }

                if (transaccion.tipo === 'ingreso') {
                    datosmensuales[clave].ingresos += transaccion.monto;
                } else {
                    datosmensuales[clave].gastos += transaccion.monto;
                }
            });

            return Object.keys(datosmensuales)
                .sort()
                .map((clave) => datosmensuales[clave]);
        } catch (error) {
            console.error('Error agrupando por mes:', error);
            return [];
        }
    }

    agruparPorSemana(transacciones) {
        try {
            const datosSemana = {};

            transacciones.forEach((transaccion) => {
                const fecha = new Date(transaccion.fecha);
                const inicioSemana = new Date(fecha);
                inicioSemana.setDate(fecha.getDate() - fecha.getDay());
                const claveS = inicioSemana.toISOString().split('T')[0];

                if (!datosSemana[claveS]) {
                    datosSemana[claveS] = {
                        periodo: `Sem. ${inicioSemana.toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric',
                        })}`,
                        ingresos: 0,
                        gastos: 0,
                    };
                }

                if (transaccion.tipo === 'ingreso') {
                    datosSemana[claveS].ingresos += transaccion.monto;
                } else {
                    datosSemana[claveS].gastos += transaccion.monto;
                }
            });

            return Object.keys(datosSemana)
                .sort()
                .map((clave) => datosSemana[clave]);
        } catch (error) {
            console.error('Error agrupando por semana:', error);
            return [];
        }
    }

    agruparPorDia(transacciones) {
        try {
            const datosDia = {};

            transacciones.forEach((transaccion) => {
                const fecha = new Date(transaccion.fecha);
                const clave = fecha.toISOString().split('T')[0];
                const diaTexto = fecha.toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric',
                });

                if (!datosDia[clave]) {
                    datosDia[clave] = {
                        periodo: diaTexto,
                        ingresos: 0,
                        gastos: 0,
                    };
                }

                if (transaccion.tipo === 'ingreso') {
                    datosDia[clave].ingresos += transaccion.monto;
                } else {
                    datosDia[clave].gastos += transaccion.monto;
                }
            });

            return Object.keys(datosDia)
                .sort()
                .map((clave) => datosDia[clave]);
        } catch (error) {
            console.error('Error agrupando por día:', error);
            return [];
        }
    }

    // ============ UTILIDADES DE GRÁFICO ============
    verificarChartJS() {
        if (typeof Chart === 'undefined') {
            this.actualizarEstadoGrafico('Chart.js no disponible', 'error');
            return false;
        }
        return true;
    }

    actualizarEstadoGrafico(mensaje, tipo = 'loading') {
        try {
            const statusElement = document.getElementById('chart-status-text');
            if (statusElement) {
                statusElement.textContent = mensaje;
                statusElement.className = `status-${tipo}`;
            }
        } catch (error) {
            console.error('Error actualizando estado del gráfico:', error);
        }
    }

    // ============ GESTIÓN DE DATOS ============
    guardarDatos() {
        try {
            const datos = {
                ingresos: this.ingresos,
                gastos: this.gastos,
                fechaGuardado: new Date().toISOString(),
            };
            localStorage.setItem('gestorPresupuesto', JSON.stringify(datos));
        } catch (error) {
            this.mostrarNotificacion('Error al guardar los datos', 'error');
        }
    }

    cargarDatos() {
        try {
            const datosGuardados = localStorage.getItem('gestorPresupuesto');
            if (datosGuardados) {
                const datos = JSON.parse(datosGuardados);
                this.ingresos = datos.ingresos || [];
                this.gastos = datos.gastos || [];

                // Validar estructura
                this.ingresos = this.ingresos.filter(
                    (item) => item && item.id && item.descripcion && typeof item.monto === 'number'
                );
                this.gastos = this.gastos.filter(
                    (item) => item && item.id && item.descripcion && typeof item.monto === 'number'
                );
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            this.ingresos = [];
            this.gastos = [];
        }
    }

    exportarDatos() {
        try {
            const datos = {
                ingresos: this.ingresos,
                gastos: this.gastos,
                fechaExportacion: new Date().toISOString(),
                version: '2.0',
                resumen: {
                    totalIngresos: this.calcularTotal(this.ingresos),
                    totalGastos: this.calcularTotal(this.gastos),
                    saldo:
                        this.calcularTotal(this.ingresos) - this.calcularTotal(this.gastos),
                    totalTransacciones: this.ingresos.length + this.gastos.length,
                },
            };

            const blob = new Blob([JSON.stringify(datos, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `presupuesto_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.mostrarNotificacion('Datos exportados correctamente', 'success');
        } catch (error) {
            this.mostrarNotificacion('Error al exportar datos', 'error');
        }
    }

    manejarImportarArchivo(event) {
        try {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const datos = JSON.parse(e.target.result);

                    // Limpiar el input de archivo
                    event.target.value = '';

                    // Manejar diferentes formatos
                    if (datos.ingresos && datos.gastos) {
                        this.ingresos = datos.ingresos;
                        this.gastos = datos.gastos;
                    } else {
                        throw new Error('Formato de archivo inválido');
                    }

                    this.guardarDatos();
                    this.refrescarDatosPagina();
                    this.mostrarNotificacion('Datos importados correctamente', 'success');
                } catch (error) {
                    this.mostrarNotificacion(
                        'Error al importar el archivo. Verifica el formato.',
                        'error'
                    );
                }
            };
            reader.readAsText(file);
        } catch (error) {
            this.mostrarNotificacion('Error al procesar el archivo', 'error');
        }
    }

    // ============ FUNCIONES DE PRUEBA Y NOTIFICACIONES ============
    probarGrafico() {
        try {
            // Datos de prueba
            const datosP = [
                {
                    id: this.generarId(),
                    descripcion: 'Salario',
                    monto: 2500,
                    fecha: new Date().toISOString(),
                    categoria: 'salario',
                    tipo: 'ingreso',
                },
                {
                    id: this.generarId(),
                    descripcion: 'Freelance',
                    monto: 800,
                    fecha: new Date().toISOString(),
                    categoria: 'freelance',
                    tipo: 'ingreso',
                },
                {
                    id: this.generarId(),
                    descripcion: 'Alquiler',
                    monto: 900,
                    fecha: new Date().toISOString(),
                    categoria: 'vivienda',
                    tipo: 'gasto',
                },
                {
                    id: this.generarId(),
                    descripcion: 'Comida',
                    monto: 400,
                    fecha: new Date().toISOString(),
                    categoria: 'comida',
                    tipo: 'gasto',
                },
                {
                    id: this.generarId(),
                    descripcion: 'Transporte',
                    monto: 200,
                    fecha: new Date().toISOString(),
                    categoria: 'transporte',
                    tipo: 'gasto',
                },
            ];

            this.ingresos = datosP.filter((item) => item.tipo === 'ingreso');
            this.gastos = datosP.filter((item) => item.tipo === 'gasto');

            this.guardarDatos();
            this.refrescarDatosPagina();
            this.mostrarNotificacion('Gráfico actualizado con datos de prueba', 'info');
        } catch (error) {
            this.mostrarNotificacion('Error al probar gráfico', 'error');
        }
    }

    mostrarMensajeBienvenida() {
        try {
            const totalTransacciones = this.ingresos.length + this.gastos.length;

            if (totalTransacciones === 0) {
                this.mostrarNotificacion(
                    '¡Bienvenido! Comienza agregando tus primeras transacciones.',
                    'info'
                );
            } else {
                this.mostrarNotificacion(
                    `Datos cargados: ${totalTransacciones} transacciones encontradas.`,
                    'success'
                );
            }
        } catch (error) {
            console.error('Error mostrando mensaje de bienvenida:', error);
        }
    }

    mostrarErrorInicializacion() {
        try {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ef4444;
        color: white;
        padding: 2rem;
        border-radius: 0.5rem;
        text-align: center;
        z-index: 10000;
        max-width: 400px;
      `;
            errorDiv.innerHTML = `
        <h3>Error de Inicialización</h3>
        <p>Hubo un problema al cargar la aplicación. Por favor, recarga la página.</p>
        <button onclick="location.reload()" style="
          background: white;
          color: #ef4444;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          cursor: pointer;
          margin-top: 1rem;
        ">Recargar Página</button>
      `;
            document.body.appendChild(errorDiv);
        } catch (displayError) {
            alert('Error al cargar la aplicación. Por favor, recarga la página.');
        }
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        try {
            const notificacion = document.createElement('div');
            notificacion.className = `notificacion notificacion-${tipo}`;
            notificacion.innerHTML = `
        <div class="notificacion-contenido">
          <i class="fas fa-${this.obtenerIconoNotificacion(tipo)}"></i>
          <span>${mensaje}</span>
        </div>
      `;

            notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${this.obtenerColorNotificacion(tipo)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
      `;

            document.body.appendChild(notificacion);

            // Animar entrada
            setTimeout(() => {
                notificacion.style.transform = 'translateX(0)';
            }, 100);

            // Remover después de 3 segundos
            setTimeout(() => {
                notificacion.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notificacion.parentNode) {
                        notificacion.parentNode.removeChild(notificacion);
                    }
                }, 300);
            }, 3000);
        } catch (error) {
            console.error('Error mostrando notificación:', error);
        }
    }

    obtenerIconoNotificacion(tipo) {
        const iconos = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle',
        };
        return iconos[tipo] || 'info-circle';
    }

    obtenerColorNotificacion(tipo) {
        const colores = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6',
        };
        return colores[tipo] || '#3b82f6';
    }
} // <-- FIN DE LA CLASE

// ===================== INICIALIZACIÓN GLOBAL =====================

// Función para mostrar error de inicialización (global, nombre distinto al de la clase)
function mostrarErrorInicializacionApp() {
    try {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ef4444;
      color: white;
      padding: 2rem;
      border-radius: 0.5rem;
      text-align: center;
      z-index: 10000;
      max-width: 400px;
    `;
        errorDiv.innerHTML = `
      <h3>Error de Inicialización</h3>
      <p>Hubo un problema al cargar la aplicación. Por favor, recarga la página.</p>
      <button onclick="location.reload()" style="
        background: white;
        color: #ef4444;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        cursor: pointer;
        margin-top: 1rem;
      ">Recargar Página</button>
    `;
        document.body.appendChild(errorDiv);
    } catch (displayError) {
        alert('Error al cargar la aplicación. Por favor, recarga la página.');
    }
}

// Función para agregar botones de exportar/importar (compatibilidad con versión anterior)
function agregarBotonesExportarImportar() {
    try {
        if (!document.querySelector('.transactions-header')) {
            setTimeout(agregarBotonesExportarImportar, 500);
            return;
        }

        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-secondary';
        exportBtn.innerHTML = '<i class="fas fa-download"></i> Exportar';
        exportBtn.onclick = (e) => {
            try {
                e.preventDefault();
                e.stopPropagation();
                if (window.gestorPresupuesto) {
                    window.gestorPresupuesto.exportarDatos();
                }
            } catch (error) {
                alert('Error al exportar datos. Intenta de nuevo.');
            }
        };

        const importInput = document.createElement('input');
        importInput.type = 'file';
        importInput.accept = '.json';
        importInput.style.display = 'none';
        importInput.onchange = (e) => {
            try {
                e.preventDefault();
                e.stopPropagation();
                if (window.gestorPresupuesto) {
                    window.gestorPresupuesto.manejarImportarArchivo(e);
                }
            } catch (error) {
                alert('Error al importar datos. Verifica el archivo e intenta de nuevo.');
            }
        };

        const importBtn = document.createElement('button');
        importBtn.className = 'btn btn-secondary';
        importBtn.innerHTML = '<i class="fas fa-upload"></i> Importar';
        importBtn.onclick = (e) => {
            try {
                e.preventDefault();
                e.stopPropagation();
                importInput.click();
            } catch (error) {
                alert('Error al abrir selector de archivo. Intenta de nuevo.');
            }
        };

        const transactionsHeader = document.querySelector('.transactions-header');
        if (transactionsHeader) {
            if (transactionsHeader.querySelector('.export-import-buttons')) {
                return;
            }

            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'export-import-buttons';
            buttonGroup.style.display = 'flex';
            buttonGroup.style.gap = '0.5rem';
            buttonGroup.appendChild(exportBtn);
            buttonGroup.appendChild(importBtn);
            buttonGroup.appendChild(importInput);

            transactionsHeader.appendChild(buttonGroup);
        }
    } catch (error) {
        setTimeout(() => {
            try {
                agregarBotonesExportarImportar();
            } catch (retryError) {
                console.error('Error agregando botones de exportar/importar:', retryError);
            }
        }, 1000);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Crear instancia global para acceso desde HTML
        window.gestorPresupuesto = new GestorPresupuesto();

        // Agregar funcionalidad de exportar/importar después de un pequeño delay
        setTimeout(() => {
            try {
                agregarBotonesExportarImportar();
            } catch (error) {
                console.error('Error agregando botones:', error);
            }
        }, 100);
    } catch (error) {
        mostrarErrorInicializacionApp();
    }
});

// Insertar estilos adicionales de manera segura
function insertarEstilosAdicionales() {
    try {
        if (document.getElementById('estilos-adicionales')) {
            return;
        }

        const estilosAdicionales = `
      .notificacion-contenido {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .notificacion-contenido i {
        font-size: 1.125rem;
      }
      input.valid {
        border-color: #10b981 !important;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
      }
      input.invalid {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
      }
      .btn-group,
      .export-import-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      @media (max-width: 768px) {
        .btn-group,
        .export-import-buttons {
        flex-direction: column;
        }
    }
    `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'estilos-adicionales';
        styleSheet.textContent = estilosAdicionales;
        document.head.appendChild(styleSheet);
    } catch (error) {
        setTimeout(insertarEstilosAdicionales, 1000);
    }
}

// Llamar a la función cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        insertarEstilosAdicionales();
    } catch (error) {
        console.error('Error insertando estilos adicionales:', error);
    }
});
