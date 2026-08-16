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
        Schema::create('disponibilidade_distrito', function (Blueprint $table) {
            $table->id();
            $table->foreignId('distrito_id')
                ->constrained('divisoes_geograficas')
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('dia_semana');
            $table->timestamps();

            $table->unique(['distrito_id', 'dia_semana']);
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE disponibilidade_distrito ADD CONSTRAINT chk_disponibilidade_dia_semana CHECK (dia_semana BETWEEN 1 AND 7)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE disponibilidade_distrito DROP CHECK chk_disponibilidade_dia_semana');
        }

        Schema::dropIfExists('disponibilidade_distrito');
    }
};
