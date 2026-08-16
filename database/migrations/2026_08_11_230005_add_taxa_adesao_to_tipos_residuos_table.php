<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tipos_residuos', function (Blueprint $table) {
            $table->decimal('taxa_adesao', 10, 2)->unsigned()->default(0);
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE tipos_residuos ADD CONSTRAINT chk_tipos_residuos_taxa_adesao CHECK (taxa_adesao >= 0)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE tipos_residuos DROP CHECK chk_tipos_residuos_taxa_adesao');
        }

        Schema::table('tipos_residuos', function (Blueprint $table) {
            $table->dropColumn('taxa_adesao');
        });
    }
};
