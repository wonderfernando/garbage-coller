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
        Schema::table('divisoes_geograficas', function (Blueprint $table) {
            $table->foreign('divisao_pai_id')
                ->references('id')
                ->on('divisoes_geograficas')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('divisoes_geograficas', function (Blueprint $table) {
            $table->dropForeign(['divisao_pai_id']);
        });
    }
};
