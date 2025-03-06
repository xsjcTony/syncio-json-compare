<?php

namespace App\Services;


use Illuminate\Support\Facades\Storage;

class JsonCompareService {

  private const string FIRST_PAYLOAD_FILE_NAME = 'json-compare-first.json';
  private const string SECOND_PAYLOAD_FILE_NAME = 'json-compare-second.json';


  public function storeFirstPayload(string $content): bool {
    return Storage::disk('local')->put(self::FIRST_PAYLOAD_FILE_NAME, $content);
  }


  public function isFirstPayloadExist(): bool {
    return Storage::disk('local')->exists(self::FIRST_PAYLOAD_FILE_NAME);
  }


  public function storeSecondPayload(string $content): bool {
    return Storage::disk('local')->put(self::SECOND_PAYLOAD_FILE_NAME, $content);
  }


  // TODO: implement this method
  public function compareJson() {}
}
