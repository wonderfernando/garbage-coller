<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UserCreationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function __construct(private readonly UserCreationService $users) {}

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:utilizadores,email'],
            'password' => ['required', 'string', 'min:8'],
            'tipo_cliente' => ['required', 'string', 'in:particular,empresa'],
            'nif' => ['nullable', 'string', 'max:20'],
            'telefone' => ['required', 'string', 'max:30'],
            'endereco_principal' => ['nullable', 'string', 'max:255'],
            'role' => ['sometimes', 'in:cliente'],
        ]);

        $user = $this->users->createCliente($data);
        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'message' => 'Conta criada com sucesso.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::validate($data)) {
            return response()->json([
                'message' => 'Email ou palavra-passe incorretos.',
            ], 401);
        }

        $user = Auth::getProvider()->retrieveByCredentials($data);

        if ($user->bloqueado) {
            return response()->json([
                'message' => 'A sua conta está bloqueada. Contacte a administração da ELISAL-EP.',
            ], 403);
        }

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'message' => 'Sessão iniciada com sucesso.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sessão terminada com sucesso.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}
