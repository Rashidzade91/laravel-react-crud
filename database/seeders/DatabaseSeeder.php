<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'is_admin' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'is_admin' => false,
            ]
        );

        Product::upsert([
            [
                'name' => 'Telefon',
                'description' => 'Smartfon, 128GB',
                'price' => 999.99,
                'count' => 12,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Notebook',
                'description' => '15.6" ekran, 16GB RAM',
                'price' => 1899.00,
                'count' => 8,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Qulaqciq',
                'description' => 'Bluetooth, noise canceling',
                'price' => 149.50,
                'count' => 25,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Smart Watch',
                'description' => 'Suya davamli',
                'price' => 229.00,
                'count' => 15,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Monitor',
                'description' => '27" IPS, 144Hz',
                'price' => 379.99,
                'count' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Klaviatura',
                'description' => 'Mexaniki RGB',
                'price' => 89.90,
                'count' => 30,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Siçan',
                'description' => 'Gaming, 16000 DPI',
                'price' => 59.00,
                'count' => 40,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Printer',
                'description' => 'Laser, Wi-Fi',
                'price' => 249.00,
                'count' => 6,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Web Kamera',
                'description' => '1080p',
                'price' => 69.00,
                'count' => 18,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'SSD',
                'description' => '1TB NVMe',
                'price' => 129.99,
                'count' => 22,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ], ['name'], ['description', 'price', 'count', 'updated_at']);
    }
}
