<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trainers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('pilates_class_trainer', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pilates_class_id')->constrained('pilates_classes')->cascadeOnDelete();
            $table->foreignId('trainer_id')->constrained('trainers')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['pilates_class_id', 'trainer_id']);
        });

        Schema::create('pilates_timetables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pilates_class_id')->constrained('pilates_classes')->cascadeOnDelete();
            $table->foreignId('trainer_id')->nullable()->constrained('trainers')->nullOnDelete();
            $table->dateTime('start_at');
            $table->unsignedInteger('capacity');
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->decimal('price_override', 12, 2)->nullable();
            $table->decimal('credit_override', 12, 2)->nullable();
            $table->enum('status', ['scheduled', 'cancelled', 'closed'])->default('scheduled');
            $table->timestamps();

            $table->index(['pilates_class_id', 'start_at']);
        });

        $classes = DB::table('pilates_classes')->select('id', 'trainers', 'scheduled_at', 'slot')->get();

        foreach ($classes as $class) {
            $names = collect(explode(',', (string) $class->trainers))
                ->map(fn ($name) => trim($name))
                ->filter()
                ->unique()
                ->values();

            $trainerIds = [];

            foreach ($names as $name) {
                $trainerId = DB::table('trainers')->where('name', $name)->value('id');

                if (! $trainerId) {
                    $trainerId = DB::table('trainers')->insertGetId([
                        'name' => $name,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                $trainerIds[] = $trainerId;

                DB::table('pilates_class_trainer')->updateOrInsert([
                    'pilates_class_id' => $class->id,
                    'trainer_id' => $trainerId,
                ], [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            if ($class->scheduled_at && $class->slot) {
                DB::table('pilates_timetables')->insert([
                    'pilates_class_id' => $class->id,
                    'trainer_id' => $trainerIds[0] ?? null,
                    'start_at' => $class->scheduled_at,
                    'capacity' => $class->slot,
                    'duration_minutes' => null,
                    'price_override' => null,
                    'credit_override' => null,
                    'status' => 'scheduled',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        Schema::table('pilates_classes', function (Blueprint $table) {
            $table->dropColumn(['scheduled_at', 'slot', 'trainers']);
        });
    }

    public function down(): void
    {
        Schema::table('pilates_classes', function (Blueprint $table) {
            $table->dateTime('scheduled_at')->nullable()->after('name');
            $table->unsignedInteger('slot')->nullable()->after('scheduled_at');
            $table->string('trainers')->nullable()->after('equipment');
        });

        $classes = DB::table('pilates_classes')->select('id')->get();

        foreach ($classes as $class) {
            $session = DB::table('pilates_timetables')
                ->where('pilates_class_id', $class->id)
                ->orderBy('start_at')
                ->first();

            $trainerNames = DB::table('pilates_class_trainer')
                ->join('trainers', 'trainers.id', '=', 'pilates_class_trainer.trainer_id')
                ->where('pilates_class_trainer.pilates_class_id', $class->id)
                ->pluck('trainers.name')
                ->implode(', ');

            DB::table('pilates_classes')->where('id', $class->id)->update([
                'scheduled_at' => $session?->start_at,
                'slot' => $session?->capacity,
                'trainers' => $trainerNames,
            ]);
        }

        Schema::dropIfExists('pilates_timetables');
        Schema::dropIfExists('pilates_class_trainer');
        Schema::dropIfExists('trainers');
    }
};
