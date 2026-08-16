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
        Schema::create('divisoes_geograficas', function (Blueprint $table) {
            $table->id();
            $table->enum('nivel', ['provincia', 'municipio', 'distrito']);
            $table->string('nome');
            $table->unsignedBigInteger('divisao_pai_id')->nullable();
            $table->timestamps();

            $table->unique(['nivel', 'divisao_pai_id', 'nome']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('divisoes_geograficas');
    }
};
