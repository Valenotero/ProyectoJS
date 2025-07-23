'use strict';

const ingresos = [];
const gastos = [];

/**
 * Pide al usuario un ingreso y lo almacena en el array `ingresos`.
 */
function agregarIngreso() {
    const descripcion = prompt('👉 Descripción del ingreso:');
    let monto = prompt('💰 Monto del ingreso (número mayor que 0):');
    monto = parseFloat(monto);

    if (isNaN(monto) || monto <= 0) {
        alert('❌ Monto inválido. Debe ser un número mayor que cero.');
        return;
    }

    ingresos.push({ descripcion, monto });
    console.log(`Ingreso agregado: ${descripcion} — $${monto.toFixed(2)}`);
}

/**
 * Pide al usuario un gasto y lo almacena en el array `gastos`.
 */
function agregarGasto() {
    const descripcion = prompt('👉 Descripción del gasto:');
    let monto = prompt('💸 Monto del gasto (número mayor que 0):');
    monto = parseFloat(monto);

    if (isNaN(monto) || monto <= 0) {
        alert('❌ Monto inválido. Debe ser un número mayor que cero.');
        return;
    }

    gastos.push({ descripcion, monto });
    console.log(`Gasto agregado: ${descripcion} — $${monto.toFixed(2)}`);
}

/**
 * Calcula totales y muestra un alert con el saldo final.
 */
function calcularSaldo() {
    const totalIngresos = ingresos.reduce((sum, item) => sum + item.monto, 0);
    const totalGastos = gastos.reduce((sum, item) => sum + item.monto, 0);
    const saldoFinal = totalIngresos - totalGastos;

    let mensaje = `📊 Resumen mensual:\n`;
    mensaje += `- Ingresos: $${totalIngresos.toFixed(2)}\n`;
    mensaje += `- Gastos:   $${totalGastos.toFixed(2)}\n`;
    mensaje += `- Saldo:    $${saldoFinal.toFixed(2)}\n\n`;
    mensaje += saldoFinal >= 0
        ? '🎉 ¡Tienes un presupuesto positivo!'
        : '⚠️  ¡Cuidado! Presupuesto negativo.';

    alert(mensaje);
    console.log('Simulación finalizada.');
}

/**
 * Bucle principal que muestra el menú y controla el flujo.
 */
function iniciarSimulador() {
    console.log('--- Iniciando simulador de presupuesto mensual ---');
    let continuar = true;

    while (continuar) {
        const opcion = prompt(
            'Elige una opción:\n' +
            '1. Agregar ingreso\n' +
            '2. Agregar gasto\n' +
            '3. Calcular saldo y terminar\n' +
            '4. Salir sin calcular'
        );

        switch (opcion) {
            case '1':
                agregarIngreso();
                break;
            case '2':
                agregarGasto();
                break;
            case '3':
                calcularSaldo();
                continuar = false;
                break;
            case '4':
                console.log('Simulador terminado por el usuario sin calcular.');
                continuar = false;
                break;
            default:
                alert('❌ Opción inválida. Debes ingresar 1, 2, 3 o 4.');
        }
    }
}

// Arranca el simulador tan pronto se carga el script
iniciarSimulador();
