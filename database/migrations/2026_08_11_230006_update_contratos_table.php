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
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE contratos DROP CHECK chk_contratos_recolhas_semana');
        }

        Schema::table('contratos', function (Blueprint $table) {
            $table->renameColumn('recolhas_por_semana', 'frequencia_semanal');
            $table->string('rua')->nullable();
            $table->string('ponto_referencia')->nullable();
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE contratos ADD CONSTRAINT chk_contratos_frequencia_semanal CHECK (frequencia_semanal > 0)');
        }

        Schema::table('contratos', function (Blueprint $table) {
            $table->dropForeign(['distrito_id']);
            $table->foreign('distrito_id')
                ->references('id')
                ->on('distritos')
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contratos', function (Blueprint $table) {
            $table->dropForeign(['distrito_id']);
            $table->foreign('distrito_id')
                ->references('id')
                ->on('divisoes_geograficas')
                ->restrictOnDelete();
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE contratos DROP CHECK chk_contratos_frequencia_semanal');
        }

        Schema::table('contratos', function (Blueprint $table) {
            $table->renameColumn('frequencia_semanal', 'recolhas_por_semana');
            $table->dropColumn(['rua', 'ponto_referencia']);
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE contratos ADD CONSTRAINT chk_contratos_recolhas_semana CHECK (recolhas_por_semana > 0)');
        }
    }
};
