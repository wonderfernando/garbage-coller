<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agendamentos_recolha', function (Blueprint $table) {
            $table->dateTime('data_recolha_anterior')->nullable()->after('data_recolha');
            $table->foreignId('reagendado_por_id')
                ->nullable()
                ->after('data_recolha_anterior')
                ->constrained('utilizadores')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('agendamentos_recolha', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reagendado_por_id');
            $table->dropColumn('data_recolha_anterior');
        });
    }
};
