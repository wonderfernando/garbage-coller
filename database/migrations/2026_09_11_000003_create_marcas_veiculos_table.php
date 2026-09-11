<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const MARCAS = ['Toyota', 'Chevrolet', 'Mitsubishi', 'Nissan', 'Hyundai'];

    public function up(): void
    {
        Schema::create('marcas_veiculos', function (Blueprint $table) {
            $table->id();
            $table->string('nome')->unique();
            $table->timestamps();
        });

        Schema::table('veiculos', function (Blueprint $table) {
            $table->foreignId('marca_id')
                ->nullable()
                ->after('matricula')
                ->constrained('marcas_veiculos')
                ->nullOnDelete();
        });

        $now = now();
        DB::table('marcas_veiculos')->insertOrIgnore(
            array_map(
                fn (string $nome) => ['nome' => $nome, 'created_at' => $now, 'updated_at' => $now],
                self::MARCAS
            )
        );
    }

    public function down(): void
    {
        Schema::table('veiculos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('marca_id');
        });

        Schema::dropIfExists('marcas_veiculos');
    }
};
