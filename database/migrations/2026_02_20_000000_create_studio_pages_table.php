<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('studio_pages', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->string('title');
            $table->text('content');
            $table->timestamps();
        });

        DB::table('studio_pages')->insert([
            ['key' => 'home', 'name' => 'Home', 'title' => 'Welcome to ORO Pilates Studio', 'content' => 'Temukan pengalaman pilates premium untuk postur, fleksibilitas, dan kekuatan core yang lebih baik.', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'about', 'name' => 'About', 'title' => 'About Our Studio', 'content' => 'Kami menghadirkan kelas pilates yang nyaman, aman, dan dibimbing instruktur profesional bersertifikat.', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'classes', 'name' => 'Classes', 'title' => 'Pilates Classes', 'content' => 'Pilih kelas Reformer, Mat, Private Session, dan Recovery sesuai kebutuhan kebugaran Anda.', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'schedule', 'name' => 'Schedule', 'title' => 'Class Schedule', 'content' => 'Lihat jadwal kelas pagi dan sore yang fleksibel untuk mendukung rutinitas harian Anda.', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'pricing', 'name' => 'Pricing', 'title' => 'Membership Pricing', 'content' => 'Nikmati pilihan paket trial, bulanan, class pack, hingga private session dengan harga transparan.', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'trainers', 'name' => 'Trainers', 'title' => 'Meet Our Trainers', 'content' => 'Tim instruktur kami berpengalaman dalam posture correction, mobility, dan rehabilitasi.', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'testimonials', 'name' => 'Testimonials', 'title' => 'What Members Say', 'content' => 'Baca pengalaman nyata member yang merasakan perubahan positif dari program kami.', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'contact', 'name' => 'Contact', 'title' => 'Contact Us', 'content' => 'Hubungi kami untuk konsultasi program, reservasi kelas, atau informasi membership.', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('studio_pages');
    }
};
