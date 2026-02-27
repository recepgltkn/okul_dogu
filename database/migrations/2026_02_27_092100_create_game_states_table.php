<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('game_states', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('state_key');
            $table->json('state_payload');
            $table->timestamps();

            $table->unique(['user_id', 'state_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_states');
    }
};
