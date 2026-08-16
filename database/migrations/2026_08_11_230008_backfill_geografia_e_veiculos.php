<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->backfillGeografia();
        $this->repointDisponibilidadeDistrito();
        $this->backfillVeiculos();
    }

    private function backfillGeografia(): void
    {
        if (! Schema::hasTable('divisoes_geograficas')) {
            return;
        }

        $oldProvincias = DB::table('divisoes_geograficas')
            ->where('nivel', 'provincia')
            ->orderBy('id')
            ->get();

        foreach ($oldProvincias as $provincia) {
            $provinciaId = DB::table('provincias')->insertGetId([
                'nome' => $provincia->nome,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $oldMunicipios = DB::table('divisoes_geograficas')
                ->where('nivel', 'municipio')
                ->where('divisao_pai_id', $provincia->id)
                ->orderBy('id')
                ->get();

            foreach ($oldMunicipios as $municipio) {
                $municipioId = DB::table('municipios')->insertGetId([
                    'provincia_id' => $provinciaId,
                    'nome' => $municipio->nome,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $oldDistritos = DB::table('divisoes_geograficas')
                    ->where('nivel', 'distrito')
                    ->where('divisao_pai_id', $municipio->id)
                    ->orderBy('id')
                    ->get();

                foreach ($oldDistritos as $distrito) {
                    DB::table('distritos')->insert([
                        'municipio_id' => $municipioId,
                        'nome' => $distrito->nome,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    private function repointDisponibilidadeDistrito(): void
    {
        if (! Schema::hasTable('disponibilidade_distrito')) {
            return;
        }

        Schema::table('disponibilidade_distrito', function (Blueprint $table) {
            $table->dropForeign(['distrito_id']);
        });

        if (Schema::hasTable('divisoes_geograficas')) {
            DB::table('disponibilidade_distrito')
                ->orderBy('id')
                ->get()
                ->each(function ($row) {
                    $novoDistrito = DB::table('divisoes_geograficas as d')
                        ->join('distritos', 'distritos.nome', '=', 'd.nome')
                        ->where('d.id', $row->distrito_id)
                        ->value('distritos.id');

                    if ($novoDistrito !== null) {
                        DB::table('disponibilidade_distrito')
                            ->where('id', $row->id)
                            ->update(['distrito_id' => $novoDistrito]);
                    }
                });
        }

        Schema::table('disponibilidade_distrito', function (Blueprint $table) {
            $table->foreign('distrito_id')
                ->references('id')
                ->on('distritos')
                ->cascadeOnDelete();
        });
    }

    private function backfillVeiculos(): void
    {
        if (! Schema::hasColumn('motoristas', 'veiculo_matricula')) {
            return;
        }

        DB::table('motoristas')
            ->whereNotNull('veiculo_matricula')
            ->orderBy('id')
            ->get()
            ->each(function ($motorista) {
                DB::table('veiculos')->insert([
                    'matricula' => $motorista->veiculo_matricula,
                    'modelo' => null,
                    'motorista_id' => $motorista->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('disponibilidade_distrito', function (Blueprint $table) {
            $table->dropForeign(['distrito_id']);
            $table->foreign('distrito_id')
                ->references('id')
                ->on('divisoes_geograficas')
                ->cascadeOnDelete();
        });

        DB::table('veiculos')->truncate();
        DB::table('distritos')->truncate();
        DB::table('municipios')->truncate();
        DB::table('provincias')->truncate();
    }
};
