<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;


class JsonCompareRequest extends FormRequest {

  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool {
    return true;
  }


  /**
   * Get the validation rules that apply to the request.
   *
   * @return array<string, ValidationRule|array|string>
   */
  public function rules(): array {
    return [
      'payload_no' => ['required', Rule::in([1, 2])],
      'json_content' => ['required', 'json'],
    ];
  }
}
