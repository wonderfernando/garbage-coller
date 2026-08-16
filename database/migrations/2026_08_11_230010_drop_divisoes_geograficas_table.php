<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('divisoes_geograficas');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Sem recreação: os dados foram migrados para provincias/municipios/distritos.
    }
};
