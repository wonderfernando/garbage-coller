<?php

use App\Http\Controllers\Api\AdminMotoristaController;
use App\Http\Controllers\Api\AdminTipoResiduoController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AdminVeiculoController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContratoAdminController;
use App\Http\Controllers\Api\ContratoClienteController;
use App\Http\Controllers\Api\DashboardAdminController;
use App\Http\Controllers\Api\DisponibilidadeDistritoController;
use App\Http\Controllers\Api\GeografiaController;
use App\Http\Controllers\Api\ReferenciaPublicaController;
use Illuminate\Support\Facades\Route;

Route::post('/registar', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/tipos-residuos', [ReferenciaPublicaController::class, 'tiposResiduos']);
Route::get('/distritos', [ReferenciaPublicaController::class, 'distritos']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

Route::middleware(['auth:sanctum', 'role:cliente'])->group(function () {
    Route::post('/contratos', [ContratoClienteController::class, 'store']);
    Route::get('/contratos', [ContratoClienteController::class, 'index']);
    Route::get('/contratos/{contrato}', [ContratoClienteController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/administracao/dashboard', [DashboardAdminController::class, 'index']);

    Route::get('/administracao/utilizadores', [AdminUserController::class, 'index']);
    Route::post('/administracao/utilizadores', [AdminUserController::class, 'store']);
    Route::get('/administracao/clientes', [AdminUserController::class, 'clientes']);
    Route::get('/administracao/clientes/{cliente}', [AdminUserController::class, 'show']);
    Route::get('/administracao/clientes/{cliente}/contratos', [AdminUserController::class, 'contratos']);
    Route::get('/administracao/clientes/{cliente}/agendamentos', [AdminUserController::class, 'agendamentos']);
    Route::post('/administracao/clientes/{cliente}/bloquear', [AdminUserController::class, 'bloquear']);
    Route::post('/administracao/clientes/{cliente}/desbloquear', [AdminUserController::class, 'desbloquear']);

    Route::get('/administracao/contratos', [ContratoAdminController::class, 'index']);
    Route::patch('/contratos/{contrato}/aprovar', [ContratoAdminController::class, 'aprovar']);
    Route::patch('/contratos/{contrato}/rejeitar', [ContratoAdminController::class, 'rejeitar']);

    Route::get('/administracao/motoristas', [AdminMotoristaController::class, 'index']);

    Route::get('/administracao/geografia', [GeografiaController::class, 'index']);
    Route::get('/administracao/distritos', [GeografiaController::class, 'distritos']);
    Route::post('/administracao/distritos/{distrito}/disponibilidade', [DisponibilidadeDistritoController::class, 'store']);
    Route::delete('/administracao/distritos/{distrito}/disponibilidade/{dia}', [DisponibilidadeDistritoController::class, 'destroy']);

    Route::get('/administracao/tipos-residuos', [AdminTipoResiduoController::class, 'index']);
    Route::post('/administracao/tipos-residuos', [AdminTipoResiduoController::class, 'store']);
    Route::get('/administracao/tipos-residuos/{tipoResiduo}', [AdminTipoResiduoController::class, 'show']);
    Route::patch('/administracao/tipos-residuos/{tipoResiduo}', [AdminTipoResiduoController::class, 'update']);
    Route::delete('/administracao/tipos-residuos/{tipoResiduo}', [AdminTipoResiduoController::class, 'destroy']);

    Route::get('/administracao/veiculos', [AdminVeiculoController::class, 'index']);
    Route::post('/administracao/veiculos', [AdminVeiculoController::class, 'store']);
    Route::get('/administracao/veiculos/{veiculo}', [AdminVeiculoController::class, 'show']);
    Route::patch('/administracao/veiculos/{veiculo}', [AdminVeiculoController::class, 'update']);
    Route::delete('/administracao/veiculos/{veiculo}', [AdminVeiculoController::class, 'destroy']);
});
