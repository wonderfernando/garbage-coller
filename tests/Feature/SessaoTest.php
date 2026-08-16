<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SessaoTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_com_credenciais_validas_devolve_token(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => 'palavra-passe',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'palavra-passe',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user'])
            ->assertJsonPath('user.email', 'login@example.com');
    }

    public function test_login_com_credenciais_invalidas_nao_devolve_token(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => 'palavra-passe',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'palavra-errada',
        ]);

        $response->assertStatus(401);
        $response->assertJsonMissingPath('token');
    }

    public function test_me_devolve_dados_do_utilizador_autenticado(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/me')
            ->assertStatus(200)
            ->assertJsonPath('email', $user->email);
    }

    public function test_me_sem_token_e_rejeitado(): void
    {
        $this->getJson('/api/me')
            ->assertStatus(401);
    }

    public function test_logout_revoga_o_token_atual(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/logout')
            ->assertStatus(200);

        $this->assertDatabaseCount('personal_access_tokens', 0);

        $this->app['auth']->forgetGuards();

        $this->withToken($token)
            ->getJson('/api/me')
            ->assertStatus(401);
    }
}
