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
            $table->enum('estado', ['pendente', 'pago', 'cancelado'])->default('pendente')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('parcelas_mensalidades', function (Blueprint $table) {
            $table->enum('estado', ['pendente', 'pago'])->default('pendente')->change();
        });
    }
};
