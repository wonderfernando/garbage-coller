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
        Schema::table('utilizadores', function (Blueprint $table) {
            $table->boolean('bloqueado')->default(false);
            $table->string('motivo_bloqueio')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('utilizadores', function (Blueprint $table) {
            $table->dropColumn(['bloqueado', 'motivo_bloqueio']);
        });
    }
};
