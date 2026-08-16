<?php

namespace Database\Seeders;

use App\Models\Distrito;
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
        $this->seedUsuarios();
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
                Distrito::query()->firstOrCreate([
                    'municipio_id' => $municipio->id,
                    'nome' => $distritoNome,
                ]);
            }
        }
    }

    protected function seedUsuarios(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'nome' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );

        User::query()->firstOrCreate(
            ['email' => 'admin@elisal.ep'],
            [
                'nome' => 'Administrador',
                'password' => bcrypt('password'),
                'role' => 'admin',
            ]
        );

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
