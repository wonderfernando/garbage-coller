<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClienteBloqueioTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function cliente(): User
    {
        return User::factory()->create(['role' => 'cliente']);
    }

    public function test_admin_pode_bloquear_cliente_com_motivo(): void
    {
        $cliente = $this->cliente();

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson("/api/administracao/clientes/{$cliente->id}/bloquear", [
                'motivo' => 'Incumprimento reiterado de pagamentos.',
            ])
            ->assertStatus(200)
            ->assertJsonPath('user.bloqueado', true)
            ->assertJsonPath('user.motivo_bloqueio', 'Incumprimento reiterado de pagamentos.');
    }

    public function test_bloquear_sem_motivo_e_rejeitado(): void
    {
        $cliente = $this->cliente();

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson("/api/administracao/clientes/{$cliente->id}/bloquear", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors('motivo');
    }

    public function test_admin_pode_desbloquear_cliente(): void
    {
        $cliente = $this->cliente();
        $cliente->update(['bloqueado' => true, 'motivo_bloqueio' => 'Motivo temporário.']);

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson("/api/administracao/clientes/{$cliente->id}/desbloquear")
            ->assertStatus(200)
            ->assertJsonPath('user.bloqueado', false)
            ->assertJsonPath('user.motivo_bloqueio', null);
    }

    public function test_cliente_bloqueado_nao_pode_iniciar_sessao(): void
    {
        $cliente = User::factory()->create([
            'role' => 'cliente',
            'email' => 'bloqueado@example.com',
            'password' => 'palavra-passe',
            'bloqueado' => true,
            'motivo_bloqueio' => 'Conta suspensa.',
        ]);

        $this->postJson('/api/login', [
            'email' => 'bloqueado@example.com',
            'password' => 'palavra-passe',
        ])->assertStatus(403);
    }

    public function test_bloquear_cliente_invalida_tokens_existentes(): void
    {
        $cliente = $this->cliente();
        $cliente->createToken('auth');

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson("/api/administracao/clientes/{$cliente->id}/bloquear", [
                'motivo' => 'Fraude detetada.',
            ])->assertStatus(200);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
