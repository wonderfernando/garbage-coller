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
        Schema::create('parcelas_mensalidades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_id')
                ->constrained('contratos')
                ->cascadeOnDelete();
            $table->unsignedInteger('numero_parcela');
            $table->decimal('valor', 10, 2)->unsigned();
            $table->date('data_vencimento');
            $table->enum('estado', ['pendente', 'pago'])->default('pendente');
            $table->date('data_pagamento')->nullable();
            $table->date('data_due')->nullable();
            $table->timestamps();

            $table->unique(['contrato_id', 'numero_parcela']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parcelas_mensalidades');
    }
};
