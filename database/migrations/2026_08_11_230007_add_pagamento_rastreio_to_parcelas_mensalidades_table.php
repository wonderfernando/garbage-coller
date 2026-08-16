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
        Schema::table('parcelas_mensalidades', function (Blueprint $table) {
            $table->foreignId('registado_por_id')
                ->nullable()
                ->after('data_pagamento')
                ->constrained('utilizadores')
                ->nullOnDelete();
            $table->string('numero_recibo')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('parcelas_mensalidades', function (Blueprint $table) {
            $table->dropForeign(['registado_por_id']);
            $table->dropColumn(['registado_por_id', 'numero_recibo']);
        });
    }
};
