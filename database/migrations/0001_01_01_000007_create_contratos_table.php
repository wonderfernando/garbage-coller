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
        Schema::create('contratos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')
                ->constrained('utilizadores')
                ->cascadeOnDelete();
            $table->foreignId('distrito_id')
                ->constrained('divisoes_geograficas')
                ->restrictOnDelete();
            $table->foreignId('tipo_residuo_id')
                ->constrained('tipos_residuos')
                ->restrictOnDelete();
            $table->decimal('taxa_adesao', 10, 2)->unsigned();
            $table->decimal('valor_mensal', 10, 2)->unsigned();
            $table->decimal('valor_total', 10, 2)->unsigned();
            $table->unsignedSmallInteger('recolhas_por_semana');
            $table->unsignedSmallInteger('duracao_meses');
            $table->enum('estado', ['pendente', 'aprovado', 'rejeitado', 'cancelado'])->default('pendente');
            $table->string('latitude')->nullable();
            $table->string('longitude')->nullable();
            $table->timestamps();
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE contratos ADD CONSTRAINT chk_contratos_recolhas_semana CHECK (recolhas_por_semana > 0)');
            DB::statement('ALTER TABLE contratos ADD CONSTRAINT chk_contratos_duracao_meses CHECK (duracao_meses > 0)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE contratos DROP CHECK chk_contratos_recolhas_semana');
            DB::statement('ALTER TABLE contratos DROP CHECK chk_contratos_duracao_meses');
        }

        Schema::dropIfExists('contratos');
    }
};
