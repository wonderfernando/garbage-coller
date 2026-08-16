<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgendamentoRecolha;
use App\Models\User;
use App\Services\ClienteBloqueioService;
use App\Services\UserCreationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function __construct(
        private readonly UserCreationService $users,
        private readonly ClienteBloqueioService $bloqueio,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = User::select('id', 'nome', 'email', 'role', 'telefone', 'endereco_principal', 'created_at')
            ->whereIn('role', ['admin', 'motorista']);

        $role = $request->query('role');
        if (in_array($role, ['admin', 'motorista'], true)) {
            $query->where('role', $role);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function clientes(): JsonResponse
    {
        $clientes = User::select('id', 'nome', 'email', 'role', 'telefone', 'tipo_cliente', 'nif', 'endereco_principal', 'bloqueado', 'motivo_bloqueio', 'created_at')
            ->where('role', 'cliente')
            ->withCount('contratos')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($clientes);
    }

    public function show(User $cliente): JsonResponse
    {
        abort_unless($cliente->role === 'cliente', 404);

        $cliente->loadCount('contratos');

        return response()->json($cliente);
    }

    public function contratos(User $cliente): JsonResponse
    {
        abort_unless($cliente->role === 'cliente', 404);

        $contratos = $cliente->contratos()
            ->with('distrito', 'tipoResiduo', 'diasSemana')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($contratos);
    }

    public function agendamentos(User $cliente): JsonResponse
    {
        abort_unless($cliente->role === 'cliente', 404);

        $agendamentos = AgendamentoRecolha::with('contrato.distrito', 'contrato.tipoResiduo', 'motorista.utilizador')
            ->whereHas('contrato', fn ($q) => $q->where('cliente_id', $cliente->id))
            ->orderByDesc('data_recolha')
            ->get();

        return response()->json($agendamentos);
    }

    public function bloquear(Request $request, User $cliente): JsonResponse
    {
        abort_unless($cliente->role === 'cliente', 404);

        $data = $request->validate([
            'motivo' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $cliente = $this->bloqueio->bloquear($cliente, $data['motivo']);

        return response()->json([
            'message' => 'Cliente bloqueado com sucesso.',
            'user' => $cliente,
        ]);
    }

    public function desbloquear(User $cliente): JsonResponse
    {
        abort_unless($cliente->role === 'cliente', 404);

        $cliente = $this->bloqueio->desbloquear($cliente);

        return response()->json([
            'message' => 'Cliente desbloqueado com sucesso.',
            'user' => $cliente,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:utilizadores,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', 'in:admin,motorista'],
            'telefone' => ['required', 'string', 'max:30'],
            'numero_carta' => ['nullable', 'required_if:role,motorista', 'string', 'max:50'],
        ]);

        $user = $data['role'] === 'motorista'
            ? $this->users->createMotorista($data)
            : $this->users->createAdmin($data);

        return response()->json([
            'message' => 'Conta criada com sucesso.',
            'user' => $user,
        ], 201);
    }
}
