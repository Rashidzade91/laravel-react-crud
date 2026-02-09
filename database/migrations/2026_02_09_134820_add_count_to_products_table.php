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
    Schema::table('products', function (Blueprint $table) {
        // 'count' sütununu 'price' sütunundan SONRA əlavə edirik
        $table->unsignedMediumInteger('count')->default(0)->after('price'); // mənfi rəqəm yazmaq olmaz
    });
}

public function down(): void
{
    Schema::table('products', function (Blueprint $table) {
        $table->dropColumn('count');
    });
}
};
