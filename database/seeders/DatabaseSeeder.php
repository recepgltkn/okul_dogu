<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'admin',
                'username' => 'admin',
                'password' => 'admin',
                'role' => 'teacher',
                'class_name' => null,
                'section' => null,
            ]
        );

        Document::updateOrCreate(
            ['path' => 'users/' . $admin->id],
            [
                'data' => [
                    'username' => 'admin',
                    'email' => 'admin@admin.com',
                    'firstName' => 'Admin',
                    'lastName' => 'User',
                    'role' => 'teacher',
                    'xp' => 0,
                    'createdAt' => now()->toISOString(),
                    'updatedAt' => now()->toISOString(),
                ],
            ]
        );
    }
}
