<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('agendamentos_recolha', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_id')
                ->constrained('contratos')
                ->cascadeOnDelete();
            $table->foreignId('motorista_id')
                ->nullable()
                ->constrained('motoristas')
                ->nullOnDelete();
            $table->dateTime('data_recolha');
            $table->enum('estado', ['pendente', 'concluido', 'cancelado'])->default('pendente');
            $table->text('observacao')->nullable();
            $table->timestamps();

            $table->index(['data_recolha', 'estado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agendamentos_recolha');
    }
};
