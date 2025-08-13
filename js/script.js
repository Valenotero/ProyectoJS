'use strict';

// Clase principal del Gestor de Presupuesto
class GestorPresupuesto {
    constructor() {
        // Inicializar arrays para almacenar transacciones
        this.ingresos = [];
        this.gastos = [];
        
        // Inicializar el gráfico
        this.chart = null;
        
        // Verificar que el DOM esté listo antes de continuar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.inicializarAplicacion();
            });
        } else {
            this.inicializarAplicacion();
        }
    }

    // Método para inicializar la aplicación de manera segura
    inicializarAplicacion() {
        try {
            // Cargar datos del localStorage al inicializar
            this.cargarDatos();
            
            // Inicializar la aplicación
            this.inicializar();
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            this.mostrarErrorInicializacion();
        }
    }

    // Método para inicializar la aplicación
    inicializar() {
        try {
            this.configurarEventos();
            this.actualizarResumen();
            this.renderizarTransacciones();
            this.inicializarGrafico();
            this.mostrarMensajeBienvenida();
        } catch (error) {
            console.error('Error en la inicialización:', error);
        }
    }

    // Mostrar error de inicialización
    mostrarErrorInicializacion() {
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
    }

    // Configurar todos los eventos de la aplicación
    configurarEventos() {
        try {
            // Eventos para formularios
            const incomeForm = document.getElementById('income-form');
            const expenseForm = document.getElementById('expense-form');
            const clearAllBtn = document.getElementById('clear-all-btn');

            if (incomeForm) {
                incomeForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.agregarIngreso();
                });
            }

            if (expenseForm) {
                expenseForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.agregarGasto();
                });
            }

            if (clearAllBtn) {
                clearAllBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.limpiarTodo();
                });
            }

            // Botón de prueba del gráfico
            const testChartBtn = document.getElementById('test-chart-btn');
            if (testChartBtn) {
                testChartBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.probarGrafico();
                });
            }

            // Eventos para inputs con validación en tiempo real
            this.configurarValidacionInputs();
        } catch (error) {
            console.error('Error al configurar eventos:', error);
        }
    }

    // Configurar validación de inputs en tiempo real
    configurarValidacionInputs() {
        try {
            const inputs = document.querySelectorAll('input[type="number"]');
            
            inputs.forEach(input => {
                input.addEventListener('input', (e) => {
                    e.preventDefault();
                    this.validarInput(e.target);
                });
                
                input.addEventListener('blur', (e) => {
                    e.preventDefault();
                    this.validarInput(e.target);
                });
            });
        } catch (error) {
            console.error('Error al configurar validación de inputs:', error);
        }
    }

    // Validar input en tiempo real
    validarInput(input) {
        const valor = parseFloat(input.value);
        const min = parseFloat(input.min);
        
        if (input.value === '') {
            input.classList.remove('valid', 'invalid');
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
    }

    // Agregar ingreso desde el formulario
    agregarIngreso() {
        const descripcion = document.getElementById('income-description').value.trim();
        const monto = parseFloat(document.getElementById('income-amount').value);

        if (!descripcion || isNaN(monto) || monto <= 0) {
            this.mostrarNotificacion('Por favor, completa todos los campos correctamente', 'error');
            return;
        }

        const ingreso = {
            id: this.generarId(),
            descripcion: descripcion,
            monto: monto,
            fecha: new Date().toISOString(),
            tipo: 'ingreso'
        };

        this.ingresos.push(ingreso);
        this.guardarDatos();
        this.actualizarResumen();
        this.renderizarTransacciones();
        this.actualizarGrafico();
        this.limpiarFormulario('income-form');
        
        this.mostrarNotificacion(`Ingreso agregado: ${descripcion} - $${monto.toFixed(2)}`, 'success');
    }

    // Agregar gasto desde el formulario
    agregarGasto() {
        const descripcion = document.getElementById('expense-description').value.trim();
        const monto = parseFloat(document.getElementById('expense-amount').value);

        if (!descripcion || isNaN(monto) || monto <= 0) {
            this.mostrarNotificacion('Por favor, completa todos los campos correctamente', 'error');
            return;
        }

        const gasto = {
            id: this.generarId(),
            descripcion: descripcion,
            monto: monto,
            fecha: new Date().toISOString(),
            tipo: 'gasto'
        };

        this.gastos.push(gasto);
        this.guardarDatos();
        this.actualizarResumen();
        this.renderizarTransacciones();
        this.actualizarGrafico();
        this.limpiarFormulario('expense-form');
        
        this.mostrarNotificacion(`Gasto agregado: ${descripcion} - $${monto.toFixed(2)}`, 'success');
    }

    // Eliminar transacción
    eliminarTransaccion(id, tipo) {
        if (tipo === 'ingreso') {
            this.ingresos = this.ingresos.filter(item => item.id !== id);
        } else {
            this.gastos = this.gastos.filter(item => item.id !== id);
        }

        this.guardarDatos();
        this.actualizarResumen();
        this.renderizarTransacciones();
        this.actualizarGrafico();
        
        this.mostrarNotificacion('Transacción eliminada correctamente', 'info');
    }

    // Limpiar todos los datos
    limpiarTodo() {
        if (confirm('¿Estás seguro de que quieres eliminar todas las transacciones? Esta acción no se puede deshacer.')) {
            this.ingresos = [];
            this.gastos = [];
            this.guardarDatos();
            this.actualizarResumen();
            this.renderizarTransacciones();
            this.actualizarGrafico();
            
            this.mostrarNotificacion('Todas las transacciones han sido eliminadas', 'info');
        }
    }

    // Actualizar resumen del presupuesto
    actualizarResumen() {
        const totalIngresos = this.calcularTotal(this.ingresos);
        const totalGastos = this.calcularTotal(this.gastos);
        const saldo = totalIngresos - totalGastos;

        // Actualizar elementos del DOM
        const totalIncomeElement = document.getElementById('total-income');
        const totalExpenseElement = document.getElementById('total-expense');
        const totalBalanceElement = document.getElementById('total-balance');

        if (totalIncomeElement) totalIncomeElement.textContent = `$${totalIngresos.toFixed(2)}`;
        if (totalExpenseElement) totalExpenseElement.textContent = `$${totalGastos.toFixed(2)}`;
        if (totalBalanceElement) {
            totalBalanceElement.textContent = `$${saldo.toFixed(2)}`;
            
            // Cambiar color según el saldo
            if (saldo >= 0) {
                totalBalanceElement.style.color = '#10b981';
            } else {
                totalBalanceElement.style.color = '#ef4444';
            }
        }
    }

    // Renderizar transacciones en el DOM
    renderizarTransacciones() {
        this.renderizarLista('income-list', this.ingresos, 'ingreso');
        this.renderizarLista('expense-list', this.gastos, 'gasto');
    }

    // Renderizar lista específica de transacciones
    renderizarLista(containerId, transacciones, tipo) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (transacciones.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-${tipo === 'ingreso' ? 'arrow-up' : 'arrow-down'}"></i>
                    <p>No hay ${tipo === 'ingreso' ? 'ingresos' : 'gastos'} registrados</p>
                </div>
            `;
            return;
        }

        const html = transacciones.map(transaccion => {
            const fecha = new Date(transaccion.fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="transaction-item" data-id="${transaccion.id}" data-tipo="${tipo}">
                    <div class="transaction-info">
                        <div class="transaction-description">${transaccion.descripcion}</div>
                        <div class="transaction-date">${fecha}</div>
                    </div>
                    <div class="transaction-amount ${tipo}">$${transaccion.monto.toFixed(2)}</div>
                    <button class="delete-btn" onclick="gestorPresupuesto.eliminarTransaccion('${transaccion.id}', '${tipo}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    // Actualizar estado del gráfico en la interfaz
    actualizarEstadoGrafico(mensaje, tipo = 'loading') {
        const statusElement = document.getElementById('chart-status-text');
        if (statusElement) {
            statusElement.textContent = mensaje;
            statusElement.className = `status-${tipo}`;
        }
    }

    // Verificar que Chart.js esté disponible
    verificarChartJS() {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js no está disponible. Verificando en 1 segundo...');
            this.actualizarEstadoGrafico('Chart.js no disponible', 'error');
            setTimeout(() => {
                if (typeof Chart === 'undefined') {
                    console.error('Chart.js aún no está disponible después de 1 segundo');
                    this.actualizarEstadoGrafico('Chart.js no disponible - Recarga la página', 'error');
                    this.mostrarNotificacion('Error: Chart.js no se pudo cargar. Recarga la página.', 'error');
                } else {
                    console.log('Chart.js ahora está disponible');
                    this.actualizarEstadoGrafico('Chart.js disponible', 'success');
                    this.inicializarGrafico();
                }
            }, 1000);
            return false;
        }
        this.actualizarEstadoGrafico('Chart.js disponible', 'success');
        return true;
    }

    // Inicializar gráfico con Chart.js
    inicializarGrafico() {
        try {
            this.actualizarEstadoGrafico('Inicializando gráfico...', 'loading');
            
            // Verificar que Chart.js esté disponible
            if (!this.verificarChartJS()) {
                return;
            }

            const ctx = document.getElementById('budget-chart');
            if (!ctx) {
                console.error('No se encontró el elemento canvas para el gráfico');
                this.actualizarEstadoGrafico('Error: Canvas no encontrado', 'error');
                return;
            }

            // Destruir el gráfico existente si hay uno
            if (this.chart) {
                try {
                    this.chart.destroy();
                } catch (destroyError) {
                    console.warn('Error al destruir gráfico existente:', destroyError);
                }
                this.chart = null;
            }

            // Crear el nuevo gráfico
            this.chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Ingresos', 'Gastos'],
                    datasets: [{
                        data: [0, 0],
                        backgroundColor: ['#10b981', '#ef4444'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
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
                                font: {
                                    size: 14
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                    return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });

            console.log('Gráfico inicializado correctamente');
            this.actualizarEstadoGrafico('Gráfico listo', 'success');
            
            // Actualizar el gráfico con los datos actuales
            this.actualizarGrafico();
            
        } catch (error) {
            console.error('Error al inicializar el gráfico:', error);
            this.actualizarEstadoGrafico('Error al inicializar', 'error');
            this.chart = null;
        }
    }

    // Actualizar gráfico
    actualizarGrafico() {
        try {
            if (!this.chart) {
                console.warn('Gráfico no inicializado, intentando inicializar...');
                this.actualizarEstadoGrafico('Reinicializando gráfico...', 'loading');
                this.inicializarGrafico();
                // Si aún no se pudo inicializar, salir
                if (!this.chart) {
                    console.error('No se pudo inicializar el gráfico');
                    this.actualizarEstadoGrafico('No se pudo inicializar', 'error');
                    return;
                }
            }

            const totalIngresos = this.calcularTotal(this.ingresos);
            const totalGastos = this.calcularTotal(this.gastos);

            // Verificar que los datos sean válidos
            if (isNaN(totalIngresos) || isNaN(totalGastos)) {
                console.error('Datos inválidos para el gráfico:', { totalIngresos, totalGastos });
                this.actualizarEstadoGrafico('Datos inválidos', 'error');
                return;
            }

            // Actualizar los datos del gráfico
            this.chart.data.datasets[0].data = [totalIngresos, totalGastos];
            
            // Forzar la actualización del gráfico
            this.chart.update('active');
            
            console.log('Gráfico actualizado:', {
                ingresos: totalIngresos,
                gastos: totalGastos,
                total: totalIngresos + totalGastos
            });
            
            this.actualizarEstadoGrafico(`Actualizado: $${totalIngresos.toFixed(2)} ingresos, $${totalGastos.toFixed(2)} gastos`, 'success');
            
        } catch (error) {
            console.error('Error al actualizar el gráfico:', error);
            this.actualizarEstadoGrafico('Error al actualizar', 'error');
            // Intentar reinicializar el gráfico si hay un error
            try {
                this.inicializarGrafico();
            } catch (reinitError) {
                console.error('Error al reinicializar el gráfico:', reinitError);
            }
        }
    }

    // Calcular total de un array de transacciones
    calcularTotal(transacciones) {
        return transacciones.reduce((sum, item) => sum + item.monto, 0);
    }

    // Generar ID único para transacciones
    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Limpiar formulario
    limpiarFormulario(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            // Remover clases de validación
            form.querySelectorAll('input').forEach(input => {
                input.classList.remove('valid', 'invalid');
            });
        }
    }

    // Mostrar notificación
    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear elemento de notificación
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.innerHTML = `
            <div class="notificacion-contenido">
                <i class="fas fa-${this.obtenerIconoNotificacion(tipo)}"></i>
                <span>${mensaje}</span>
            </div>
        `;

        // Agregar estilos CSS inline para la notificación
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

        // Agregar al DOM
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
    }

    // Obtener icono para notificación
    obtenerIconoNotificacion(tipo) {
        const iconos = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return iconos[tipo] || 'info-circle';
    }

    // Obtener color para notificación
    obtenerColorNotificacion(tipo) {
        const colores = {
            'success': '#10b981',
            'error': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6'
        };
        return colores[tipo] || '#3b82f6';
    }

    // Guardar datos en localStorage
    guardarDatos() {
        const datos = {
            ingresos: this.ingresos,
            gastos: this.gastos,
            fechaGuardado: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('gestorPresupuesto', JSON.stringify(datos));
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            this.mostrarNotificacion('Error al guardar los datos', 'error');
        }
    }

    // Cargar datos desde localStorage
    cargarDatos() {
        try {
            const datosGuardados = localStorage.getItem('gestorPresupuesto');
            if (datosGuardados) {
                const datos = JSON.parse(datosGuardados);
                this.ingresos = datos.ingresos || [];
                this.gastos = datos.gastos || [];
                
                // Validar que los datos tengan la estructura correcta
                this.ingresos = this.ingresos.filter(item => 
                    item && item.id && item.descripcion && typeof item.monto === 'number'
                );
                this.gastos = this.gastos.filter(item => 
                    item && item.id && item.descripcion && typeof item.monto === 'number'
                );
            }
        } catch (error) {
            console.error('Error al cargar datos del localStorage:', error);
            this.ingresos = [];
            this.gastos = [];
        }
    }

    // Mostrar mensaje de bienvenida
    mostrarMensajeBienvenida() {
        const totalTransacciones = this.ingresos.length + this.gastos.length;
        
        if (totalTransacciones === 0) {
            this.mostrarNotificacion('¡Bienvenido al Gestor de Presupuesto! Comienza agregando tus ingresos y gastos.', 'info');
        } else {
            this.mostrarNotificacion(`Datos cargados: ${totalTransacciones} transacciones encontradas.`, 'success');
        }
    }

    // Exportar datos como JSON
    exportarDatos() {
        const datos = {
            ingresos: this.ingresos,
            gastos: this.gastos,
            fechaExportacion: new Date().toISOString(),
            resumen: {
                totalIngresos: this.calcularTotal(this.ingresos),
                totalGastos: this.calcularTotal(this.gastos),
                saldo: this.calcularTotal(this.ingresos) - this.calcularTotal(this.gastos)
            }
        };

        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `presupuesto_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.mostrarNotificacion('Datos exportados correctamente', 'success');
    }

    // Importar datos desde archivo JSON
    importarDatos(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const datos = JSON.parse(e.target.result);
                
                if (datos.ingresos && datos.gastos) {
                    // Limpiar el input de archivo
                    event.target.value = '';
                    
                    // Actualizar los datos
                    this.ingresos = datos.ingresos;
                    this.gastos = datos.gastos;
                    
                    // Guardar en localStorage
                    this.guardarDatos();
                    
                    // Actualizar la interfaz en el orden correcto
                    this.actualizarResumen();
                    this.renderizarTransacciones();
                    
                    // Forzar la actualización del gráfico con un pequeño delay
                    setTimeout(() => {
                        this.actualizarGrafico();
                    }, 100);
                    
                    this.mostrarNotificacion('Datos importados correctamente', 'success');
                    
                    // Log para debugging
                    console.log('Datos importados:', {
                        ingresos: this.ingresos.length,
                        gastos: this.gastos.length,
                        totalIngresos: this.calcularTotal(this.ingresos),
                        totalGastos: this.calcularTotal(this.gastos)
                    });
                } else {
                    throw new Error('Formato de archivo inválido');
                }
            } catch (error) {
                console.error('Error al importar:', error);
                this.mostrarNotificacion('Error al importar el archivo. Verifica el formato.', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Probar el gráfico (ejemplo de uso)
    probarGrafico() {
        this.ingresos = [
            { id: this.generarId(), descripcion: 'Salario', monto: 2500, fecha: '2023-10-20T10:00:00Z', tipo: 'ingreso' },
            { id: this.generarId(), descripcion: 'Venta de libros', monto: 150, fecha: '2023-10-21T14:30:00Z', tipo: 'ingreso' },
            { id: this.generarId(), descripcion: 'Alquiler', monto: 800, fecha: '2023-10-22T09:00:00Z', tipo: 'gasto' },
            { id: this.generarId(), descripcion: 'Comida', monto: 120, fecha: '2023-10-22T12:00:00Z', tipo: 'gasto' },
            { id: this.generarId(), descripcion: 'Transporte', monto: 100, fecha: '2023-10-22T15:00:00Z', tipo: 'gasto' }
        ];
        this.gastos = [
            { id: this.generarId(), descripcion: 'Alquiler', monto: 800, fecha: '2023-10-22T09:00:00Z', tipo: 'gasto' },
            { id: this.generarId(), descripcion: 'Comida', monto: 120, fecha: '2023-10-22T12:00:00Z', tipo: 'gasto' },
            { id: this.generarId(), descripcion: 'Transporte', monto: 100, fecha: '2023-10-22T15:00:00Z', tipo: 'gasto' }
        ];
        this.guardarDatos();
        this.actualizarResumen();
        this.renderizarTransacciones();
        this.actualizarGrafico();
        this.mostrarNotificacion('Gráfico actualizado con datos de prueba.', 'info');
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
                this.agregarBotonesExportarImportar();
            } catch (error) {
                console.error('Error al agregar botones de exportar/importar:', error);
            }
        }, 100);
        
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        this.mostrarErrorInicializacion();
    }
});

// Función para agregar botones de exportar/importar
function agregarBotonesExportarImportar() {
    try {
        // Agregar funcionalidad de exportar/importar
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-secondary';
        exportBtn.innerHTML = '<i class="fas fa-download"></i> Exportar';
        exportBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.gestorPresupuesto) {
                window.gestorPresupuesto.exportarDatos();
            }
        };
        
        const importInput = document.createElement('input');
        importInput.type = 'file';
        importInput.accept = '.json';
        importInput.style.display = 'none';
        importInput.onchange = (e) => {
            e.preventDefault();
            if (window.gestorPresupuesto) {
                window.gestorPresupuesto.importarDatos(e);
            }
        };
        
        const importBtn = document.createElement('button');
        importBtn.className = 'btn btn-secondary';
        importBtn.innerHTML = '<i class="fas fa-upload"></i> Importar';
        importBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            importInput.click();
        };
        
        // Agregar botones al header de transacciones
        const transactionsHeader = document.querySelector('.transactions-header');
        if (transactionsHeader) {
            const buttonGroup = document.createElement('div');
            buttonGroup.style.display = 'flex';
            buttonGroup.style.gap = '0.5rem';
            buttonGroup.appendChild(exportBtn);
            buttonGroup.appendChild(importBtn);
            buttonGroup.appendChild(importInput);
            
            transactionsHeader.appendChild(buttonGroup);
        }
    } catch (error) {
        console.error('Error al configurar botones de exportar/importar:', error);
    }
}

// Agregar estilos CSS para notificaciones y validación
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
    
    .btn-group {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    
    @media (max-width: 768px) {
        .btn-group {
            flex-direction: column;
        }
    }
`;

// Insertar estilos adicionales de manera segura
try {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = estilosAdicionales;
    document.head.appendChild(styleSheet);
} catch (error) {
    console.error('Error al insertar estilos adicionales:', error);
}
