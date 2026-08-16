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
        Schema::create('provincias', function (Blueprint $table) {
            $table->id();
            $table->string('nome')->unique();
            $table->timestamps();
        });

        Schema::create('municipios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provincia_id')
                ->constrained('provincias')
                ->cascadeOnDelete();
            $table->string('nome');
            $table->timestamps();

            $table->unique(['provincia_id', 'nome']);
        });

        Schema::create('distritos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('municipio_id')
                ->constrained('municipios')
                ->cascadeOnDelete();
            $table->string('nome');
            $table->timestamps();

            $table->unique(['municipio_id', 'nome']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('distritos');
        Schema::dropIfExists('municipios');
        Schema::dropIfExists('provincias');
    }
};
