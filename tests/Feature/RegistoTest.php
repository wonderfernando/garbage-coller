<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegistoTest extends TestCase
{
    use RefreshDatabase;

    public function test_registo_valido_cria_conta_de_cliente(): void
    {
        $response = $this->postJson('/api/registar', [
            'nome' => 'João Cliente',
            'email' => 'joao@example.com',
            'password' => 'palavra-passe',
            'tipo_cliente' => 'particular',
            'telefone' => '+244 900 000 000',
            'endereco_principal' => 'Rua da Samba, Luanda',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.role', 'cliente')
            ->assertJsonPath('user.email', 'joao@example.com')
            ->assertJsonStructure(['token']);

        $this->assertDatabaseHas('utilizadores', [
            'email' => 'joao@example.com',
            'role' => 'cliente',
            'endereco_principal' => 'Rua da Samba, Luanda',
        ]);

        $user = User::where('email', 'joao@example.com')->first();
        $this->assertTrue(Hash::check('palavra-passe', $user->password));
        $this->assertNotSame('palavra-passe', $user->password);
    }

    public function test_registo_com_email_duplicado_e_rejeitado(): void
    {
        User::factory()->create(['email' => 'duplicado@example.com']);

        $response = $this->postJson('/api/registar', [
            'nome' => 'Outro Cliente',
            'email' => 'duplicado@example.com',
            'password' => 'palavra-passe',
            'tipo_cliente' => 'particular',
            'telefone' => '+244 900 000 001',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_registo_com_perfil_nao_permitido_e_rejeitado(): void
    {
        $response = $this->postJson('/api/registar', [
            'nome' => 'Hacker Cliente',
            'email' => 'hacker@example.com',
            'password' => 'palavra-passe',
            'tipo_cliente' => 'particular',
            'telefone' => '+244 900 000 002',
            'role' => 'motorista',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('role');

        $this->assertDatabaseMissing('utilizadores', [
            'email' => 'hacker@example.com',
        ]);
    }

    public function test_registo_omite_role_e_forca_cliente(): void
    {
        $this->postJson('/api/registar', [
            'nome' => 'Cliente Sem Role',
            'email' => 'semrole@example.com',
            'password' => 'palavra-passe',
            'tipo_cliente' => 'empresa',
            'nif' => '5410000000',
            'telefone' => '+244 900 000 003',
        ])->assertStatus(201);

        $this->assertDatabaseHas('utilizadores', [
            'email' => 'semrole@example.com',
            'role' => 'cliente',
        ]);
    }
}
