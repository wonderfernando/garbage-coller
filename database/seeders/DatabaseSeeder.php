<?php

namespace Database\Seeders;

use App\Models\DisponibilidadeDistrito;
use App\Models\Distrito;
use App\Models\MarcaVeiculo;
use App\Models\Motorista;
use App\Models\Municipio;
use App\Models\Provincia;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->seedGeografiaLuanda();
        $this->seedMarcasVeiculo();
        $this->seedUsuarios();
    }

    protected function seedMarcasVeiculo(): void
    {
        foreach (['Toyota', 'Chevrolet', 'Mitsubishi', 'Nissan', 'Hyundai'] as $nome) {
            MarcaVeiculo::query()->firstOrCreate(['nome' => $nome]);
        }
    }

    protected function seedGeografiaLuanda(): void
    {
        Distrito::query()->delete();
        Municipio::query()->delete();
        Provincia::query()->delete();

        $luanda = Provincia::query()->firstOrCreate([
            'nome' => 'Luanda',
        ]);

        $municipios = [
            'Belas' => ['Belas', 'Camama', 'Vila de Belas'],
            'Cacuaco' => ['Cacuaco', 'Mongolote'],
            'Cazenga' => ['Cazenga', 'Morro do Moco'],
            'Ingombota' => ['Ingombota', 'Morro da Cruz'],
            'Luanda' => ['Maianga', 'Samba', 'Rangel'],
            'Maianga' => ['Maianga', 'Bairro da Polícia'],
            'Sambizanga' => ['Sambizanga', 'Bairro Operário'],
            'Viana' => ['Viana', 'Catete'],
        ];

        foreach ($municipios as $municipioNome => $distritos) {
            $municipio = Municipio::query()->firstOrCreate([
                'provincia_id' => $luanda->id,
                'nome' => $municipioNome,
            ]);

            foreach ($distritos as $distritoNome) {
                $distrito = Distrito::query()->firstOrCreate([
                    'municipio_id' => $municipio->id,
                    'nome' => $distritoNome,
                ]);

                $this->seedDisponibilidade($distrito->id);
            }
        }
    }

    protected function seedDisponibilidade(int $distritoId): void
    {
        $padroes = [
            [1, 3, 5],
            [2, 4, 6],
            [1, 2, 3],
            [4, 5, 6],
        ];

        $dias = $padroes[$distritoId % count($padroes)];

        foreach ($dias as $dia) {
            DisponibilidadeDistrito::query()->firstOrCreate([
                'distrito_id' => $distritoId,
                'dia_semana' => $dia,
            ]);
        }
    }

    protected function seedUsuarios(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'nome' => 'Test User',
                'password' => bcrypt('password'),
                'telefone' => '+244 900 000 000',
            ]
        );

        User::query()->firstOrCreate(
            ['email' => 'admin@elisal.ep'],
            [
                'nome' => 'Administrador',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'telefone' => '+244 911 000 000',
            ]
        );

        User::query()->firstOrCreate(
            ['email' => 'motorista@elisal.ep'],
            [
                'nome' => 'Motorista Demo',
                'password' => bcrypt('password'),
                'role' => 'motorista',
                'telefone' => '+244 922 000 000',
            ]
        );

        $motoristaUser = User::query()->where('email', 'motorista@elisal.ep')->first();

        if ($motoristaUser) {
            Motorista::query()->firstOrCreate(
                ['utilizador_id' => $motoristaUser->id],
                ['numero_carta' => 'MOT-0001']
            );
        }

        User::query()->firstOrCreate(
            ['email' => 'cliente@elisal.ep'],
            [
                'nome' => 'Cliente Demo',
                'password' => bcrypt('password'),
                'role' => 'cliente',
                'tipo_cliente' => 'particular',
                'telefone' => '+244 923 000 000',
                'nif' => '0000000000',
                'endereco_principal' => 'Rua do Cliente, Luanda',
            ]
        );
    }
}
