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
        Schema::create('contrato_dias_semana', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_id')
                ->constrained('contratos')
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('dia_semana');
            $table->timestamps();

            $table->unique(['contrato_id', 'dia_semana']);
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE contrato_dias_semana ADD CONSTRAINT chk_contrato_dias_semana_dia CHECK (dia_semana BETWEEN 1 AND 7)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE contrato_dias_semana DROP CHECK chk_contrato_dias_semana_dia');
        }

        Schema::dropIfExists('contrato_dias_semana');
    }
};
