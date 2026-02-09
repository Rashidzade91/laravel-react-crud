<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'min:3'],
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'count' => 'required|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Mehsulun adi mutleqdir.',
            'name.string' => 'Mehsulun adi string olmalidir.',
            'name.max' => 'Mehsulun adi maksimum 255 simvol ola bilər.',
            'name.min' => 'Mehsulun adi minimum 3 simvol olmalidir.',
            'price.required' => 'Mehsulun qiymeti mutleqdir.',
            'price.numeric' => 'Mehsulun qiymeti reqem olmalidir.',
            'price.min' => 'Mehsulun qiymeti 0-dan kicik ola bilmez.',
            'count.required' => 'Mehsulun sayi mutleqdir.',
            'count.integer' => 'Mehsulun sayi reqem olmalidir.',
            'count.min' => 'Mehsulun sayi 0-dan kicik ola bilmez.',
        ];
    }
}
